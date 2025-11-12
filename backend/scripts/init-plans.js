// Script to initialize subscription plans
// Usage: node scripts/init-plans.js

require('dotenv').config()
const mongoose = require('mongoose')
const Plan = require('../src/models/Plan')

const initPlans = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/empowerher')
    console.log('✅ Connected to MongoDB')

    // Free Plan
    const freePlan = {
      name: 'free',
      displayName: 'Free Plan',
      price: 0,
      currency: 'USD',
      interval: 'month',
      features: {
        maxReportsPerMonth: 3,
        unlimitedReports: false,
        prioritySupport: false,
        detailedTracking: false,
        downloadReports: false,
        smsNotifications: false,
        emailNotifications: true,
        advancedAnalytics: false,
        caseNotesAccess: false
      },
      isActive: true,
      description: 'Basic features for reporting incidents'
    }

    // Premium Plan
    const premiumPlan = {
      name: 'premium',
      displayName: 'Premium Plan',
      price: 9.99,
      currency: 'USD',
      interval: 'month',
      features: {
        maxReportsPerMonth: -1, // Unlimited
        unlimitedReports: true,
        prioritySupport: true,
        detailedTracking: true,
        downloadReports: true,
        smsNotifications: true,
        emailNotifications: true,
        advancedAnalytics: true,
        caseNotesAccess: true
      },
      isActive: true,
      description: 'Unlimited reports and premium features'
    }

    // Create or update plans
    for (const planData of [freePlan, premiumPlan]) {
      let plan = await Plan.findOne({ name: planData.name })
      
      if (plan) {
        // Update existing plan
        Object.assign(plan, planData)
        await plan.save()
        console.log(`✅ Updated ${planData.displayName}`)
      } else {
        // Create new plan
        plan = new Plan(planData)
        await plan.save()
        console.log(`✅ Created ${planData.displayName}`)
      }
    }

    console.log('✅ Plans initialized successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error initializing plans:', error)
    process.exit(1)
  }
}

initPlans()




