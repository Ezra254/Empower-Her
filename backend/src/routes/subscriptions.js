const express = require('express')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const Plan = require('../models/Plan')
const Subscription = require('../models/Subscription')
const { protect } = require('../middleware/auth')
const { getSubscriptionInfo } = require('../middleware/subscription')
const paystackService = require('../services/paystack')
const router = express.Router()

// @route   GET /api/subscriptions/plans
// @desc    Get all available plans
// @access  Public
router.get('/plans', async (req, res) => {
  try {
    await Plan.ensureDefaultPlans()
    const plans = await Plan.find({ isActive: true }).sort({ price: 1 })
    
    res.json({
      plans: plans.map(plan => ({
        id: plan._id,
        name: plan.name,
        displayName: plan.displayName,
        price: plan.price,
        currency: plan.currency,
        interval: plan.interval,
        features: plan.features,
        description: plan.description
      }))
    })
  } catch (error) {
    console.error('Get plans error:', error)
    res.status(500).json({ 
      message: 'Failed to get plans',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

// @route   GET /api/subscriptions/my-subscription
// @desc    Get current user's subscription
// @access  Private
router.get('/my-subscription', protect, getSubscriptionInfo, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    const plan = await Plan.getPlan(user.subscription.plan || 'free')
    
    // Get subscription details if exists
    const subscription = await Subscription.findOne({ 
      userId: user._id,
      status: { $in: ['active', 'trial'] }
    }).sort({ createdAt: -1 })

    res.json({
      subscription: {
        plan: user.subscription.plan || 'free',
        status: user.subscription.status || 'active',
        currentPeriodStart: user.subscription.currentPeriodStart,
        currentPeriodEnd: user.subscription.currentPeriodEnd,
        cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
        usage: user.usage,
        planDetails: plan ? {
          name: plan.name,
          displayName: plan.displayName,
          price: plan.price,
          features: plan.features
        } : null,
        stripeSubscriptionId: subscription?.stripeSubscriptionId || null
      }
    })
  } catch (error) {
    console.error('Get subscription error:', error)
    res.status(500).json({ 
      message: 'Failed to get subscription',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

// @route   POST /api/subscriptions/initiate-payment
// @desc    Initiate payment for subscription via Paystack
// @access  Private
router.post('/initiate-payment', protect, [
  body('plan').isIn(['free', 'premium']).withMessage('Invalid plan selected'),
  body('paymentMethod').isIn(['card']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { plan, paymentMethod } = req.body
    const user = await User.findById(req.user._id)
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    // Free plan doesn't require payment
    if (plan === 'free') {
      return res.status(400).json({ message: 'Free plan does not require payment' })
    }

    // Get plan details
    const planDetails = await Plan.getPlan(plan)
    if (!planDetails) {
      return res.status(400).json({ message: 'Plan not found' })
    }

    // Check if Paystack is configured
    if (!paystackService.publicKey || !paystackService.secretKey) {
      return res.status(500).json({ 
        message: 'Payment gateway not configured. Please contact support.' 
      })
    }

    // Prepare payment data
    const amount = planDetails.price
    const currency = planDetails.currency || 'KES'
    const callbackUrl = process.env.PAYSTACK_REDIRECT_URL || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscription`

    // Create payment metadata
    const metadata = {
      userId: user._id.toString(),
      userEmail: user.email,
      plan: plan,
      subscriptionType: 'premium',
      gateway: 'paystack'
    }

    const paymentResult = await paystackService.createPaymentSession({
      amount,
      currency,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      callbackUrl,
      metadata
    })

    if (!paymentResult.success) {
      return res.status(400).json({
        message: paymentResult.error || 'Failed to initiate payment',
        error: paymentResult.details
      })
    }

    // Store payment information in subscription record
    let subscription = await Subscription.findOne({ userId: user._id })
    if (!subscription) {
      subscription = new Subscription({
        userId: user._id,
        plan: plan,
        status: 'pending',
        stripeSubscriptionId: paymentResult.paymentId, // Reusing field for payment ID
        metadata: new Map(Object.entries({
          paymentId: paymentResult.paymentId,
          apiRef: paymentResult.apiRef,
          paymentMethod: paymentMethod,
          amount: amount.toString(),
          currency: currency
        }))
      })
    } else {
      subscription.status = 'pending'
      subscription.stripeSubscriptionId = paymentResult.paymentId
      subscription.metadata = new Map(Object.entries({
        paymentId: paymentResult.paymentId,
        apiRef: paymentResult.apiRef,
        paymentMethod: paymentMethod,
        amount: amount.toString(),
        currency: currency
      }))
    }
    await subscription.save()

    res.json({
      message: 'Payment initiated successfully',
      payment: {
        paymentId: paymentResult.paymentId,
        apiRef: paymentResult.apiRef,
        status: paymentResult.status,
        paymentMethod: paymentMethod,
        ...(paymentResult.paymentLink ? { paymentLink: paymentResult.paymentLink } : {})
      },
      instructions: paymentResult.paymentLink 
        ? 'Please complete the payment using the secure Paystack checkout page.'
        : 'Complete the payment in the Paystack window.'
    })

  } catch (error) {
    console.error('Initiate payment error:', error)
    res.status(500).json({ 
      message: 'Failed to initiate payment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

// @route   POST /api/subscriptions/webhook
// @desc    Webhook handler for Paystack payment callbacks
// @access  Public (Paystack calls this)
router.post('/webhook', express.json(), async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature']
    const webhookData = req.body || {}

    const processedWebhook = paystackService.processWebhook(webhookData, signature)

    if (!processedWebhook.valid) {
      console.error('Invalid webhook:', processedWebhook.error)
      return res.status(400).json({ error: 'Invalid webhook signature' })
    }

    const metadata = processedWebhook.metadata || webhookData.data?.metadata || {}
    const userId = metadata.userId || metadata.user_id
    const plan = metadata.plan || 'premium'

    if (!userId) {
      console.error('User ID not found in webhook metadata')
      return res.status(400).json({ error: 'User ID not found' })
    }

    // Find user and subscription
    const user = await User.findById(userId)
    if (!user) {
      console.error('User not found:', userId)
      return res.status(404).json({ error: 'User not found' })
    }

    // Find subscription by payment ID - check both metadata map and stripeSubscriptionId field
    const paymentId = processedWebhook.paymentId || webhookData.data?.reference
    const subscription = await Subscription.findOne({ 
      $or: [
        { userId: user._id, stripeSubscriptionId: paymentId },
        { userId: user._id, 'metadata.paymentId': paymentId }
      ]
    })

    if (processedWebhook.isSuccess) {
      // Payment successful - activate subscription
      const now = new Date()
      const periodEnd = new Date(now)
      periodEnd.setMonth(periodEnd.getMonth() + 1) // 1 month subscription

      // Update user subscription
      user.subscription.plan = plan
      user.subscription.status = 'active'
      user.subscription.currentPeriodStart = now
      user.subscription.currentPeriodEnd = periodEnd
      user.subscription.cancelAtPeriodEnd = false
      user.subscription.subscriptionId = paymentId
      await user.save()

      // Update subscription record
      if (subscription) {
        subscription.plan = plan
        subscription.status = 'active'
        subscription.currentPeriodStart = now
        subscription.currentPeriodEnd = periodEnd
        subscription.cancelAtPeriodEnd = false
        subscription.stripeSubscriptionId = paymentId
        await subscription.save()
      } else {
        const newSubscription = new Subscription({
          userId: user._id,
          plan: plan,
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          stripeSubscriptionId: paymentId,
          metadata: new Map(Object.entries({
            paymentId: paymentId,
            apiRef: processedWebhook.apiRef || webhookData.api_ref || '',
            amount: processedWebhook.amount?.toString() || webhookData.amount?.toString() || '',
            currency: processedWebhook.currency || webhookData.currency || 'KES',
            paidAt: new Date().toISOString()
          }))
        })
        await newSubscription.save()
      }

      console.log('Subscription activated for user:', userId)
    } else {
      // Payment failed or pending
      if (subscription) {
        subscription.status = 'past_due'
        await subscription.save()
      }
      console.log('Payment not successful for user:', userId, 'Status:', processedWebhook.status)
    }

    // Return success to Paystack
    res.json({ received: true, status: 'processed' })

  } catch (error) {
    console.error('Webhook processing error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

// @route   POST /api/subscriptions/subscribe
// @desc    Subscribe to free plan (no payment required)
// @access  Private
router.post('/subscribe', protect, [
  body('plan').isIn(['free', 'premium']).withMessage('Invalid plan selected')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { plan } = req.body
    const user = await User.findById(req.user._id)
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    // Get plan details
    const planDetails = await Plan.getPlan(plan)
    if (!planDetails) {
      return res.status(400).json({ message: 'Plan not found' })
    }

    // Premium plan requires payment - redirect to payment initiation
    if (plan === 'premium') {
      return res.status(400).json({ 
        message: 'Premium plan requires payment. Please use /initiate-payment endpoint.',
        requiresPayment: true
      })
    }

    // If user is already on this plan and it's active, return success
    if (user.subscription.plan === plan && user.subscription.status === 'active') {
      return res.json({
        message: 'You are already subscribed to this plan',
        subscription: {
          plan: user.subscription.plan,
          status: user.subscription.status
        }
      })
    }

    // Update user subscription for free plan
    const now = new Date()
    user.subscription.plan = plan
    user.subscription.status = 'active'
    user.subscription.currentPeriodStart = now
    user.subscription.currentPeriodEnd = null // Free plan has no end date
    user.subscription.cancelAtPeriodEnd = false

    await user.save()

    // Create or update subscription record
    let subscription = await Subscription.findOne({ userId: user._id })
    if (subscription) {
      subscription.plan = plan
      subscription.status = 'active'
      subscription.currentPeriodStart = now
      subscription.currentPeriodEnd = null
      subscription.cancelAtPeriodEnd = false
      await subscription.save()
    } else {
      subscription = new Subscription({
        userId: user._id,
        plan: plan,
        status: 'active',
        currentPeriodStart: now
      })
      await subscription.save()
    }

    res.json({
      message: `Successfully subscribed to ${planDetails.displayName} plan`,
      subscription: {
        plan: user.subscription.plan,
        status: user.subscription.status,
        currentPeriodStart: user.subscription.currentPeriodStart,
        currentPeriodEnd: user.subscription.currentPeriodEnd,
        features: planDetails.features
      }
    })

  } catch (error) {
    console.error('Subscribe error:', error)
    res.status(500).json({ 
      message: 'Failed to subscribe',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

// @route   POST /api/subscriptions/cancel
// @desc    Cancel subscription (cancels at end of period)
// @access  Private
router.post('/cancel', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    if (user.subscription.plan === 'free') {
      return res.status(400).json({ message: 'You are not subscribed to any paid plan' })
    }

    // Set cancellation at period end
    user.subscription.cancelAtPeriodEnd = true
    await user.save()

    // Update subscription record
    const subscription = await Subscription.findOne({ userId: user._id })
    if (subscription) {
      subscription.cancelAtPeriodEnd = true
      subscription.cancelledAt = new Date()
      await subscription.save()
    }

    res.json({
      message: 'Subscription will be cancelled at the end of the current billing period',
      subscription: {
        plan: user.subscription.plan,
        status: user.subscription.status,
        currentPeriodEnd: user.subscription.currentPeriodEnd,
        cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd
      }
    })

  } catch (error) {
    console.error('Cancel subscription error:', error)
    res.status(500).json({ 
      message: 'Failed to cancel subscription',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

// @route   POST /api/subscriptions/reactivate
// @desc    Reactivate cancelled subscription
// @access  Private
router.post('/reactivate', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    if (user.subscription.plan === 'free') {
      return res.status(400).json({ message: 'You are not subscribed to any paid plan' })
    }

    // Reactivate subscription
    user.subscription.cancelAtPeriodEnd = false
    user.subscription.status = 'active'
    await user.save()

    // Update subscription record
    const subscription = await Subscription.findOne({ userId: user._id })
    if (subscription) {
      subscription.cancelAtPeriodEnd = false
      subscription.status = 'active'
      await subscription.save()
    }

    res.json({
      message: 'Subscription reactivated successfully',
      subscription: {
        plan: user.subscription.plan,
        status: user.subscription.status,
        cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd
      }
    })

  } catch (error) {
    console.error('Reactivate subscription error:', error)
    res.status(500).json({ 
      message: 'Failed to reactivate subscription',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

module.exports = router



