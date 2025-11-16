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
      console.error('User not found in checkReportLimit:', req.user._id)
      return res.status(401).json({ message: 'User not found' })
    }

    // Initialize usage if not present
    if (!user.usage || typeof user.usage.reportsThisMonth === 'undefined') {
      console.log('Initializing user usage:', user._id)
      user.usage = {
        reportsThisMonth: 0,
        lastResetDate: new Date()
      }
      await user.save()
    }

    console.log('Report limit check for user:', {
      userId: user._id,
      plan: user.subscription?.plan,
      status: user.subscription?.status,
      reportsThisMonth: user.usage?.reportsThisMonth,
      role: user.role
    })

    // Admins have unlimited reports
    if (user.role === 'admin') {
      console.log('Admin user - unlimited reports')
      return next()
    }

    // Premium users have unlimited reports
    if (user.subscription?.plan === 'premium' && user.subscription?.status === 'active') {
      if (user.subscription.currentPeriodEnd && new Date() > new Date(user.subscription.currentPeriodEnd)) {
        // Subscription expired, treat as free
        console.log('Premium subscription expired, switching to free')
        user.subscription.status = 'expired'
        user.subscription.plan = 'free'
        await user.save()
      } else {
        console.log('Premium user - unlimited reports')
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
    const lastReset = user.usage.lastResetDate ? new Date(user.usage.lastResetDate) : now
    const isNewMonth = now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()

    if (isNewMonth) {
      console.log('New month detected - resetting report count for user:', user._id)
      user.usage.reportsThisMonth = 0
      user.usage.lastResetDate = now
      await user.save()
    }

    // Ensure reportsThisMonth is a number
    const reportsUsed = Number(user.usage.reportsThisMonth) || 0
    const maxReports = Number(plan.features.maxReportsPerMonth) || 3

    console.log('Checking report limit:', {
      reportsUsed,
      maxReports,
      limitReached: reportsUsed >= maxReports
    })

    // Check if user has reached the limit (>= means after N reports, the N+1th is blocked)
    // Example: maxReportsPerMonth = 3, so after 3 reports (reportsThisMonth = 3), the 4th is blocked
    if (reportsUsed >= maxReports) {
      console.log('Report limit reached for user:', {
        userId: user._id,
        reportsUsed,
        maxReports
      })
      return res.status(403).json({ 
        message: `You have reached your monthly report limit of ${maxReports} reports. Please upgrade to premium for unlimited reports.`,
        requiresUpgrade: true,
        currentPlan: 'free',
        reportsUsed: reportsUsed,
        reportsLimit: maxReports,
        remainingReports: 0
      })
    }

    console.log('Report limit check passed - user can submit report')
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






