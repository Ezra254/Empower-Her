const User = require('../models/User')
const Plan = require('../models/Plan')

/**
 * Middleware to check if user has premium subscription
 */
const requirePremium = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    // Admins always have access
    if (user.role === 'admin') {
      return next()
    }

    // Check if user has premium plan
    if (user.subscription.plan === 'premium' && user.subscription.status === 'active') {
      // Check if subscription is still valid
      if (user.subscription.currentPeriodEnd && new Date() > user.subscription.currentPeriodEnd) {
        // Subscription expired
        user.subscription.status = 'expired'
        user.subscription.plan = 'free'
        await user.save()
        return res.status(403).json({ 
          message: 'Your premium subscription has expired. Please renew to continue using premium features.',
          requiresUpgrade: true
        })
      }
      return next()
    }

    // User doesn't have premium
    return res.status(403).json({ 
      message: 'This feature requires a premium subscription. Please upgrade to continue.',
      requiresUpgrade: true,
      currentPlan: user.subscription.plan
    })

  } catch (error) {
    console.error('Subscription check error:', error)
    return res.status(500).json({ 
      message: 'Error checking subscription status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
}

/**
 * Middleware to check report limits for free users
 */
const checkReportLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    // Admins have unlimited reports
    if (user.role === 'admin') {
      return next()
    }

    // Premium users have unlimited reports
    if (user.subscription.plan === 'premium' && user.subscription.status === 'active') {
      if (user.subscription.currentPeriodEnd && new Date() > user.subscription.currentPeriodEnd) {
        // Subscription expired, treat as free
        user.subscription.status = 'expired'
        user.subscription.plan = 'free'
        await user.save()
      } else {
        return next()
      }
    }

    // Free users have limits
    const plan = await Plan.getPlan('free')
    if (!plan) {
      return res.status(500).json({ message: 'Free plan not configured' })
    }

    // Reset monthly count if it's a new month
    const now = new Date()
    const lastReset = new Date(user.usage.lastResetDate)
    const isNewMonth = now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()

    if (isNewMonth) {
      user.usage.reportsThisMonth = 0
      user.usage.lastResetDate = now
      await user.save()
    }

    // Check if user has reached the limit
    if (user.usage.reportsThisMonth >= plan.features.maxReportsPerMonth) {
      return res.status(403).json({ 
        message: `You have reached your monthly report limit of ${plan.features.maxReportsPerMonth} reports. Upgrade to premium for unlimited reports.`,
        requiresUpgrade: true,
        currentPlan: 'free',
        reportsUsed: user.usage.reportsThisMonth,
        reportsLimit: plan.features.maxReportsPerMonth
      })
    }

    // User can submit report
    req.userUsage = user.usage
    next()

  } catch (error) {
    console.error('Report limit check error:', error)
    return res.status(500).json({ 
      message: 'Error checking report limit',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
}

/**
 * Middleware to get user's subscription info
 */
const getSubscriptionInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    const plan = await Plan.getPlan(user.subscription.plan || 'free')
    
    req.userSubscription = {
      plan: user.subscription.plan || 'free',
      status: user.subscription.status || 'active',
      currentPeriodEnd: user.subscription.currentPeriodEnd,
      cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
      usage: user.usage,
      planFeatures: plan ? plan.features : null
    }

    next()
  } catch (error) {
    console.error('Get subscription info error:', error)
    next()
  }
}

module.exports = {
  requirePremium,
  checkReportLimit,
  getSubscriptionInfo
}






