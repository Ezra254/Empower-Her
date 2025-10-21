const mongoose = require('mongoose')

const reportSchema = new mongoose.Schema({
  obNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  personalInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  },
  incidentDetails: {
    type: {
      type: String,
      required: true,
      enum: [
        'Physical Violence',
        'Sexual Violence',
        'Emotional/Psychological Abuse',
        'Economic Abuse',
        'Digital/Online Harassment',
        'Stalking',
        'Threats/Intimidation',
        'Other'
      ]
    },
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    witnesses: {
      type: String,
      trim: true,
      default: ''
    },
    evidence: {
      type: String,
      trim: true,
      default: ''
    }
  },
  urgency: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  status: {
    type: String,
    required: true,
    enum: [
      'submitted',
      'under_review',
      'investigating',
      'case_assigned',
      'in_progress',
      'resolved',
      'closed',
      'referred'
    ],
    default: 'submitted'
  },
  consent: {
    contact: {
      type: Boolean,
      required: true
    },
    share: {
      type: Boolean,
      required: true
    }
  },
  assignedOfficer: {
    name: String,
    badgeNumber: String,
    department: String,
    contactInfo: String
  },
  caseNotes: [{
    note: {
      type: String,
      required: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    isPublic: {
      type: Boolean,
      default: false
    }
  }],
  nextSteps: [{
    step: String,
    dueDate: Date,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  resolvedAt: Date,
  policeReference: String,
  courtCaseNumber: String
}, {
  timestamps: true
})

// Indexes for better query performance
reportSchema.index({ obNumber: 1 })
reportSchema.index({ 'personalInfo.email': 1 })
reportSchema.index({ status: 1 })
reportSchema.index({ urgency: 1 })
reportSchema.index({ submittedAt: -1 })

// Virtual for full name
reportSchema.virtual('personalInfo.fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`
})

// Method to update status
reportSchema.methods.updateStatus = function(newStatus, notes, userId) {
  this.status = newStatus
  this.lastUpdated = new Date()
  
  if (notes) {
    this.caseNotes.push({
      note: notes,
      addedBy: userId,
      addedAt: new Date()
    })
  }
  
  if (newStatus === 'resolved' || newStatus === 'closed') {
    this.resolvedAt = new Date()
  }
  
  return this.save()
}

// Static method to get reports by status
reportSchema.statics.getByStatus = function(status) {
  return this.find({ status }).sort({ submittedAt: -1 })
}

// Static method to get urgent reports
reportSchema.statics.getUrgent = function() {
  return this.find({ 
    urgency: { $in: ['high', 'emergency'] },
    status: { $nin: ['resolved', 'closed'] }
  }).sort({ submittedAt: -1 })
}

module.exports = mongoose.model('Report', reportSchema)
