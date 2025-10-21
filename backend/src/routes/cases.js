const express = require('express')
const Report = require('../models/Report')
const auth = require('../middleware/auth')
const router = express.Router()

// @route   GET /api/cases
// @desc    Get all cases (admin/officer only)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Check if user has permission
    if (!['admin', 'officer'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const { status, urgency, page = 1, limit = 10 } = req.query
    const query = {}

    if (status) query.status = status
    if (urgency) query.urgency = urgency

    const reports = await Report.find(query)
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-personalInfo -consent')

    const total = await Report.countDocuments(query)

    res.json({
      reports,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    })

  } catch (error) {
    console.error('Get cases error:', error)
    res.status(500).json({ 
      message: 'Failed to get cases',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

// @route   GET /api/cases/urgent
// @desc    Get urgent cases
// @access  Private (Admin/Officer)
router.get('/urgent', auth, async (req, res) => {
  try {
    if (!['admin', 'officer'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const urgentReports = await Report.getUrgent()

    res.json({ reports: urgentReports })

  } catch (error) {
    console.error('Get urgent cases error:', error)
    res.status(500).json({ 
      message: 'Failed to get urgent cases',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

// @route   GET /api/cases/stats
// @desc    Get case statistics
// @access  Private (Admin only)
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' })
    }

    const stats = await Report.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const urgencyStats = await Report.aggregate([
      {
        $group: {
          _id: '$urgency',
          count: { $sum: 1 }
        }
      }
    ])

    const monthlyStats = await Report.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$submittedAt' },
            month: { $month: '$submittedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    res.json({
      statusStats: stats,
      urgencyStats,
      monthlyStats
    })

  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ 
      message: 'Failed to get statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

module.exports = router
