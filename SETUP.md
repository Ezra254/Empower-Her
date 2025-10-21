# EmpowerHer - Development Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- Git

### 1. Clone and Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd empowerher

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Environment Configuration

#### Backend (.env)
```bash
cd backend
cp env.example .env
# Edit .env with your configuration
```

#### Frontend (.env.local)
```bash
cd frontend
cp env.example .env.local
# Edit .env.local with your configuration
```

### 3. Database Setup
```bash
# Start MongoDB (if running locally)
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in backend/.env
```

### 4. Run Development Servers

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

## 🏗 Project Structure

```
empowerher/
├── frontend/                 # Next.js React application
│   ├── components/           # Reusable UI components
│   ├── pages/               # Next.js pages/routes
│   ├── styles/              # CSS and styling
│   └── utils/               # Helper functions
├── backend/                  # Node.js Express API
│   ├── src/
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   └── server.js        # Main server file
│   └── package.json
├── docs/                    # Documentation
└── README.md
```

## 🔧 Key Features Implemented

### Frontend (Next.js + React)
- ✅ Responsive landing page
- ✅ Multi-step incident reporting form
- ✅ Form validation with Zod
- ✅ Modern UI with Tailwind CSS
- ✅ Modal-based reporting system
- ✅ Mobile-responsive design

### Backend (Node.js + Express)
- ✅ RESTful API endpoints
- ✅ MongoDB integration with Mongoose
- ✅ JWT authentication
- ✅ Input validation with express-validator
- ✅ Rate limiting and security middleware
- ✅ User roles (user, admin, officer)
- ✅ Report status tracking

### Database Models
- ✅ User model with authentication
- ✅ Report model with comprehensive fields
- ✅ Case tracking and status updates
- ✅ Admin dashboard capabilities

## 📱 API Endpoints

### Reports
- `POST /api/reports` - Submit new incident report
- `GET /api/reports/:obNumber` - Get report status
- `PUT /api/reports/:obNumber/status` - Update report status (admin)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Cases (Admin/Officer)
- `GET /api/cases` - Get all cases
- `GET /api/cases/urgent` - Get urgent cases
- `GET /api/cases/stats` - Get case statistics

### Admin
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create new user

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation and sanitization
- CORS configuration
- Helmet security headers
- Role-based access control

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Railway/Render)
```bash
cd backend
# Deploy to your preferred platform
```

## 📊 Database Schema

### Report Model
- Personal information (encrypted)
- Incident details
- Status tracking
- Case notes and updates
- OB number generation
- Consent management

### User Model
- Authentication data
- Role-based permissions
- Profile information
- Department/badge info (for officers)

## 🔄 Next Steps

1. **Add Real-time Features**
   - Socket.io for live updates
   - Push notifications
   - Real-time status changes

2. **File Upload System**
   - Evidence upload
   - Secure file storage
   - Image/document processing

3. **Police Database Integration**
   - Real OB number generation
   - Case synchronization
   - Status updates from police systems

4. **Advanced Features**
   - SMS notifications
   - Email confirmations
   - Case analytics dashboard
   - Mobile app (React Native)

5. **Testing & Quality**
   - Unit tests
   - Integration tests
   - E2E testing
   - Performance optimization

## 🆘 Support

For technical support or questions:
- Email: support@empowerher.org
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

---

*EmpowerHer: Empowering Victims, Accelerating Justice*
