const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const compression = require('compression')
const morgan = require('morgan')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())
app.use(compression())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use(limiter)

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ]
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(null, true) // Allow all origins in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Body parsing middleware
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    if (buf && buf.length) {
      req.rawBody = Buffer.from(buf)
    }
  }
}))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging
app.use(morgan('combined'))

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/empowerher')
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err)
  console.log('💡 Make sure MongoDB is running or use MongoDB Atlas')
})

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/reports', require('./routes/reports'))
app.use('/api/cases', require('./routes/cases'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/subscriptions', require('./routes/subscriptions'))

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'EmpowerHer API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      reports: '/api/reports',
      auth: '/api/auth',
      cases: '/api/cases',
      admin: '/api/admin',
      subscriptions: '/api/subscriptions'
    }
  })
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`)
})

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`)
    console.log(`💡 Another process is using port ${PORT}`)
    console.log(`💡 On Windows, you can find and kill it with: netstat -ano | findstr :${PORT}`)
    console.log(`💡 Then run: taskkill /PID <PID> /F`)
    process.exit(1)
  } else {
    console.error('❌ Server error:', error)
    process.exit(1)
  }
})

module.exports = app
