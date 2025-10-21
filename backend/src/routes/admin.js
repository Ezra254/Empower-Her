const express = require('express')
const Report = require('../models/Report')
const User = require('../models/User')
const auth = require('../middleware/auth')
const router = express.Router()

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin only)
router.get('/dashboard', auth, async (req, res) => {
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
router.get('/users', auth, async (req, res) => {
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
router.post('/users', auth, async (req, res) => {
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

module.exports = router
