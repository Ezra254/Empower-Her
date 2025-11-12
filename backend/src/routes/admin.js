const express = require('express')
const Report = require('../models/Report')
const User = require('../models/User')
const { protect } = require('../middleware/auth')
const router = express.Router()

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin only)
router.get('/dashboard', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' })
    }

    const totalReports = await Report.countDocuments()
    const pendingReports = await Report.countDocuments({ status: 'submitted' })
    const urgentReports = await Report.countDocuments({ urgency: { $in: ['high', 'emergency'] } })
    const resolvedReports = await Report.countDocuments({ status: 'resolved' })

    const recentReports = await Report.find()
      .sort({ submittedAt: -1 })
      .limit(5)
      .select('obNumber status urgency submittedAt')

    res.json({
      stats: {
        totalReports,
        pendingReports,
        urgentReports,
        resolvedReports
      },
      recentReports
    })

  } catch (error) {
    console.error('Admin dashboard error:', error)
    res.status(500).json({ 
      message: 'Failed to get dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' })
    }

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })

    res.json({ users })

  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ 
      message: 'Failed to get users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

// @route   POST /api/admin/users
// @desc    Create a new user
// @access  Private (Admin only)
router.post('/users', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' })
    }

    const { firstName, lastName, email, password, role, department, badgeNumber } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role,
      department,
      badgeNumber
    })

    await user.save()

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department,
        badgeNumber: user.badgeNumber
      }
    })

  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({ 
      message: 'Failed to create user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

// @route   GET /api/admin/reports
// @desc    Get all reports (admin only)
// @access  Private (Admin only)
router.get('/reports', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' })
    }

    const { status, urgency, page = 1, limit = 20 } = req.query
    const query = {}

    if (status) query.status = status
    if (urgency) query.urgency = urgency

    const reports = await Report.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Report.countDocuments(query)

    res.json({
      reports,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    })
  } catch (error) {
    console.error('Get reports error:', error)
    res.status(500).json({ 
      message: 'Failed to get reports',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

// @route   GET /api/admin/reports/:obNumber
// @desc    Get single report details (admin only)
// @access  Private (Admin only)
router.get('/reports/:obNumber', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' })
    }

    const { obNumber } = req.params
    const report = await Report.findOne({ obNumber })
      .populate('userId', 'firstName lastName email')
      .populate('statusUpdates.updatedBy', 'firstName lastName')
      .populate('caseNotes.addedBy', 'firstName lastName')

    if (!report) {
      return res.status(404).json({ message: 'Report not found' })
    }

    res.json({ report })
  } catch (error) {
    console.error('Get report error:', error)
    res.status(500).json({ 
      message: 'Failed to get report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

// @route   PUT /api/admin/reports/:obNumber/status
// @desc    Update report status and add status update (admin only)
// @access  Private (Admin only)
router.put('/reports/:obNumber/status', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' })
    }

    const { obNumber } = req.params
    const { status, message, assignedOfficer, handlingParties } = req.body

    const report = await Report.findOne({ obNumber })
    if (!report) {
      return res.status(404).json({ message: 'Report not found' })
    }

    // Update status if provided
    if (status && status !== report.status) {
      report.status = status
      report.lastUpdated = new Date()

      // Add status update
      report.statusUpdates.push({
        status: status,
        message: message || `Status updated to ${status}`,
        updatedBy: req.user._id,
        updatedAt: new Date(),
        isPublic: true
      })

      if (status === 'resolved' || status === 'completed' || status === 'closed') {
        report.resolvedAt = new Date()
      }
    }

    // Update assigned officer if provided
    if (assignedOfficer) {
      report.assignedOfficer = {
        ...report.assignedOfficer,
        ...assignedOfficer
      }
    }

    // Update handling parties if provided
    if (handlingParties && Array.isArray(handlingParties)) {
      report.handlingParties = handlingParties
    }

    // Add case note if message provided without status change
    if (message && !status) {
      report.caseNotes.push({
        note: message,
        addedBy: req.user._id,
        addedAt: new Date(),
        isPublic: true
      })
    }

    await report.save()

    res.json({
      message: 'Report updated successfully',
      obNumber: report.obNumber,
      status: report.status,
      statusUpdates: report.statusUpdates
    })
  } catch (error) {
    console.error('Update report error:', error)
    res.status(500).json({ 
      message: 'Failed to update report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

module.exports = router
