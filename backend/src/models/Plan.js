const mongoose = require('mongoose')

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

// Static method to get plan by name
planSchema.statics.getPlan = async function(planName) {
  return await this.findOne({ name: planName, isActive: true })
}

module.exports = mongoose.model('Plan', planSchema)






