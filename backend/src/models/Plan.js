const mongoose = require('mongoose')

const DEFAULT_PLANS = {
  free: {
    name: 'free',
    displayName: 'Free Plan',
    price: 0,
    currency: 'KES',
    interval: 'month',
    description: 'Start reporting incidents with up to 3 reports per month.',
    features: {
      maxReportsPerMonth: 3,
      unlimitedReports: false,
      prioritySupport: false,
      detailedTracking: false,
      downloadReports: false,
      smsNotifications: false,
      emailNotifications: true,
      advancedAnalytics: false,
      caseNotesAccess: true
    }
  },
  premium: {
    name: 'premium',
    displayName: 'Premium Plan',
    price: 9.99,
    currency: 'KES',
    interval: 'month',
    description: 'Unlimited reports, priority support, and advanced tracking.',
    features: {
      maxReportsPerMonth: 999,
      unlimitedReports: true,
      prioritySupport: true,
      detailedTracking: true,
      downloadReports: true,
      smsNotifications: true,
      emailNotifications: true,
      advancedAnalytics: true,
      caseNotesAccess: true
    }
  }
}

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['free', 'premium']
  },
  displayName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  interval: {
    type: String,
    enum: ['month', 'year'],
    default: 'month'
  },
  features: {
    maxReportsPerMonth: {
      type: Number,
      default: 3 // Free plan: 3 reports per month
    },
    unlimitedReports: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    },
    detailedTracking: {
      type: Boolean,
      default: false
    },
    downloadReports: {
      type: Boolean,
      default: false
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    advancedAnalytics: {
      type: Boolean,
      default: false
    },
    caseNotesAccess: {
      type: Boolean,
      default: false
    }
  },
  stripePriceId: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: String
}, {
  timestamps: true
})

planSchema.statics.ensureDefaultPlans = async function() {
  await Promise.all(
    Object.values(DEFAULT_PLANS).map(async (defaultPlan) => {
      await this.updateOne(
        { name: defaultPlan.name },
        { $setOnInsert: defaultPlan },
        { upsert: true }
      )
    })
  )
}

// Static method to get plan by name (and auto-create defaults if missing)
planSchema.statics.getPlan = async function(planName) {
  await this.ensureDefaultPlans()
  return this.findOne({ name: planName, isActive: true })
}

planSchema.statics.getDefaultPlans = function() {
  return Object.values(DEFAULT_PLANS)
}

module.exports = mongoose.model('Plan', planSchema)






