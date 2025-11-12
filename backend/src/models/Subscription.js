const mongoose = require('mongoose')

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['free', 'premium'],
    required: true,
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'trial', 'past_due', 'pending'],
    default: 'active'
  },
  stripeCustomerId: {
    type: String,
    default: null
  },
  stripeSubscriptionId: {
    type: String,
    default: null
  },
  stripePriceId: {
    type: String,
    default: null
  },
  currentPeriodStart: {
    type: Date,
    default: Date.now
  },
  currentPeriodEnd: {
    type: Date,
    default: () => {
      const date = new Date()
      date.setMonth(date.getMonth() + 1) // Default to 1 month from now
      return date
    }
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  cancelledAt: Date,
  trialStart: Date,
  trialEnd: Date,
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
})

// Indexes
subscriptionSchema.index({ userId: 1 })
subscriptionSchema.index({ stripeCustomerId: 1 })
subscriptionSchema.index({ stripeSubscriptionId: 1 })
subscriptionSchema.index({ status: 1 })

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && new Date() < this.currentPeriodEnd
}

// Method to check if subscription is premium
subscriptionSchema.methods.isPremium = function() {
  return this.plan === 'premium' && this.isActive()
}

module.exports = mongoose.model('Subscription', subscriptionSchema)



