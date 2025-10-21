const express = require('express')
const { body, validationResult } = require('express-validator')
const Report = require('../models/Report')
const auth = require('../middleware/auth')
const router = express.Router()

// @route   POST /api/reports
// @desc    Submit a new incident report
// @access  Public (but will be rate limited)
router.post('/', [
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone').isLength({ min: 10 }).withMessage('Please provide a valid phone number'),
  body('incidentType').notEmpty().withMessage('Incident type is required'),
  body('incidentDate').isISO8601().withMessage('Please provide a valid date'),
  body('incidentTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Please provide a valid time'),
  body('location').trim().isLength({ min: 5 }).withMessage('Location must be at least 5 characters'),
  body('description').trim().isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  body('urgency').isIn(['low', 'medium', 'high', 'emergency']).withMessage('Invalid urgency level'),
  body('consentToContact').isBoolean().withMessage('Consent to contact is required'),
  body('consentToShare').isBoolean().withMessage('Consent to share is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      incidentType,
      incidentDate,
      incidentTime,
      location,
      description,
      witnesses,
      evidence,
      urgency,
      consentToContact,
      consentToShare
    } = req.body

    // Generate unique OB number
    const obNumber = `OB-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Create new report
    const report = new Report({
      obNumber,
      personalInfo: {
        firstName,
        lastName,
        email,
        phone
      },
      incidentDetails: {
        type: incidentType,
        date: incidentDate,
        time: incidentTime,
        location,
        description,
        witnesses: witnesses || '',
        evidence: evidence || ''
      },
      urgency,
      consent: {
        contact: consentToContact,
        share: consentToShare
      },
      status: 'submitted',
      submittedAt: new Date()
    })

    await report.save()

    // TODO: Send confirmation email
    // TODO: Notify relevant authorities if high urgency
    // TODO: Generate police database entry

    res.status(201).json({
      message: 'Report submitted successfully',
      obNumber: report.obNumber,
      status: report.status,
      submittedAt: report.submittedAt
    })

  } catch (error) {
    console.error('Report submission error:', error)
    res.status(500).json({ 
      message: 'Failed to submit report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

// @route   GET /api/reports/:obNumber
// @desc    Get report status by OB number
// @access  Public
router.get('/:obNumber', async (req, res) => {
  try {
    const { obNumber } = req.params

    const report = await Report.findOne({ obNumber })
    if (!report) {
      return res.status(404).json({ message: 'Report not found' })
    }

    // Return only safe information
    res.json({
      obNumber: report.obNumber,
      status: report.status,
      submittedAt: report.submittedAt,
      lastUpdated: report.lastUpdated,
      assignedOfficer: report.assignedOfficer,
      caseNotes: report.caseNotes,
      nextSteps: report.nextSteps
    })

  } catch (error) {
    console.error('Report retrieval error:', error)
    res.status(500).json({ 
      message: 'Failed to retrieve report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

// @route   PUT /api/reports/:obNumber/status
// @desc    Update report status (admin only)
// @access  Private (Admin)
router.put('/:obNumber/status', auth, async (req, res) => {
  try {
    const { obNumber } = req.params
    const { status, notes, assignedOfficer } = req.body

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' })
    }

    const report = await Report.findOne({ obNumber })
    if (!report) {
      return res.status(404).json({ message: 'Report not found' })
    }

    // Update report
    report.status = status || report.status
    report.lastUpdated = new Date()
    
    if (notes) {
      report.caseNotes.push({
        note: notes,
        addedBy: req.user.id,
        addedAt: new Date()
      })
    }

    if (assignedOfficer) {
      report.assignedOfficer = assignedOfficer
    }

    await report.save()

    res.json({
      message: 'Report status updated successfully',
      obNumber: report.obNumber,
      status: report.status,
      lastUpdated: report.lastUpdated
    })

  } catch (error) {
    console.error('Report update error:', error)
    res.status(500).json({ 
      message: 'Failed to update report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

module.exports = router
