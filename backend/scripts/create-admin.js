// Script to create an admin user
// Usage: node scripts/create-admin.js

require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../src/models/User')

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/empowerher')
    console.log('✅ Connected to MongoDB')

    // Admin details
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@empowerher.org',
      password: 'Password@31',
      role: 'admin',
      badgeNumber: 'EM8407',
      department: 'Administration'
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: adminData.email },
        { badgeNumber: adminData.badgeNumber }
      ]
    })

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists. Updating password and badge number...')
      existingAdmin.password = adminData.password
      existingAdmin.badgeNumber = adminData.badgeNumber
      existingAdmin.firstName = adminData.firstName
      existingAdmin.lastName = adminData.lastName
      existingAdmin.email = adminData.email
      existingAdmin.role = 'admin'
      existingAdmin.department = adminData.department
      await existingAdmin.save()
      console.log('✅ Admin user updated successfully!')
      console.log('   Email:', adminData.email)
      console.log('   Admin ID: ADMIN-EM8407')
      console.log('   Password: Password@31')
      console.log('   You can login with either:')
      console.log('   - Email: admin@empowerher.org')
      console.log('   - Admin ID: ADMIN-EM8407')
      process.exit(0)
    }

    // Create admin user
    const admin = new User(adminData)
    await admin.save()

    console.log('✅ Admin user created successfully!')
    console.log('   Email:', adminData.email)
    console.log('   Admin ID: ADMIN-EM8407')
    console.log('   Password: Password@31')
    console.log('   You can login with either:')
    console.log('   - Email: admin@empowerher.org')
    console.log('   - Admin ID: ADMIN-EM8407')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin:', error)
    process.exit(1)
  }
}

createAdmin()

