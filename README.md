# EmpowerHer - Gender-Based Violence Reporting Platform

<div align="center">

![EmpowerHer Logo](https://img.shields.io/badge/EmpowerHer-GBV%20Platform-purple?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

**A secure, accessible platform for reporting gender-based violence incidents and tracking case progress**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Team](#-team) • [Setup](#-getting-started) • [Documentation](#-documentation) • [Deployment](#-deployment)

</div>

---

## 📖 About

EmpowerHer is a comprehensive web application designed to combat gender-based violence (GBV) by providing a secure, accessible platform for reporting incidents, obtaining electronic OB numbers from police databases, and tracking case status updates until justice is served.

### 🎯 Mission

Bridge victims and authorities, reducing hurdles and accelerating justice for gender-based violence cases through technology.

### 🌟 Vision

To create a world where every victim of gender-based violence has access to justice, support, and protection through innovative technology solutions.

---

## ✨ Features

### Core Features

- **🔒 Secure Incident Reporting**
  - Multi-step reporting form with validation
  - Evidence upload support (images, documents)
  - End-to-end encryption for sensitive data
  - Anonymous reporting option

- **📋 OB Number Generation**
  - Integration with police database systems
  - Unique case identifiers (OB numbers)
  - Automatic case registration
  - Real-time status updates

- **📊 Case Tracking**
  - Real-time case status updates
  - Historical case logs
  - Progress notifications
  - Case timeline visualization

- **👥 User Management**
  - Secure authentication (JWT)
  - Role-based access control (Admin, User, Officer)
  - User profiles and preferences
  - Activity tracking

- **💳 Subscription System**
  - Free and Premium plans
  - Card payment integration (Paystack)
  - Subscription management
  - Usage tracking and limits

- **📱 Admin Dashboard**
  - Case management interface
  - User management
  - Analytics and reporting
  - System configuration

- **🔔 Notifications**
  - Email notifications
  - SMS notifications (Premium)
  - Real-time updates
  - Case status alerts

- **📚 Resource Hub**
  - Support services directory
  - Helpline information
  - Legal resources
  - Educational materials

---

## 🛠 Tech Stack

### Frontend

- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, Heroicons
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Hooks
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **File Upload**: React Dropzone

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting, Bcrypt
- **Validation**: Express Validator
- **File Upload**: Multer
- **Payment Gateway**: Paystack (Card payments)
- **Logging**: Morgan
- **Compression**: Compression middleware

### DevOps & Deployment

- **Frontend Hosting**: Vercel / Netlify
- **Backend Hosting**: Render / Railway
- **Database**: MongoDB Atlas
- **Containerization**: Docker
- **CI/CD**: Git-based deployments

---

## 👥 Team

### Project Team Members

| Name | Role | Primary Responsibilities |
|------|------|------------------------|
| **Ezra** | Backend Lead Developer | API development, Database design, Authentication system, Payment integration |
| **Stephen** | Frontend Lead Developer | UI/UX design, React components, User interface, Frontend architecture |
| **Alex** | Full-Stack Developer | Backend routes, Frontend integration, API endpoints, Feature implementation |
| **Abel** | Backend Developer | Database models, Middleware development, Security implementation, Testing |
| **Immaculate** | Frontend Developer | UI components, User experience, Responsive design, Form validation |

### Detailed Contributions

#### 🔧 Backend Team

**Ezra (Backend Lead)**
- Designed and implemented RESTful API architecture
- Developed authentication and authorization system (JWT)
- Integrated Paystack payment gateway for subscriptions
- Created database schemas and models (User, Report, Case, Subscription, Plan)
- Implemented webhook handlers for payment processing
- Set up security middleware (Helmet, CORS, Rate Limiting)
- Developed subscription management system
- Created admin API endpoints

**Abel (Backend Developer)**
- Designed MongoDB database schemas
- Implemented data models (User, Report, Case, Subscription, Plan, Resource)
- Developed middleware for authentication and subscription checks
- Created validation logic for API endpoints
- Implemented error handling and logging
- Developed utility scripts (create-admin, init-plans)
- Set up database connection and configuration

**Alex (Full-Stack - Backend Focus)**
- Developed API routes (auth, reports, cases, subscriptions, admin)
- Implemented file upload handling
- Created case management endpoints
- Developed report submission and tracking logic
- Implemented OB number generation system
- Created admin dashboard API endpoints

#### 🎨 Frontend Team

**Stephen (Frontend Lead)**
- Designed overall UI/UX architecture
- Implemented Next.js application structure
- Developed routing and navigation
- Created authentication flow (login, register)
- Implemented dashboard layout and components
- Developed subscription management UI
- Created responsive design system

**Immaculate (Frontend Developer)**
- Developed reusable UI components
- Created ReportModal component with multi-step form
- Implemented form validation with Zod
- Designed user dashboard interface
- Created subscription page with payment integration
- Implemented responsive layouts for mobile devices
- Developed admin dashboard UI

**Alex (Full-Stack - Frontend Focus)**
- Integrated frontend with backend API
- Implemented API service layer (auth.ts)
- Created data fetching and state management
- Developed error handling in frontend
- Implemented payment flow integration
- Created real-time update mechanisms

---

## 📁 Project Structure

```
empowerher/
├── backend/                    # Node.js Express Backend
│   ├── src/
│   │   ├── models/            # MongoDB Schemas
│   │   │   ├── User.js
│   │   │   ├── Report.js
│   │   │   ├── Case.js
│   │   │   ├── Subscription.js
│   │   │   ├── Plan.js
│   │   │   └── Resource.js
│   │   ├── routes/            # API Routes
│   │   │   ├── auth.js        # Authentication endpoints
│   │   │   ├── reports.js    # Report management
│   │   │   ├── cases.js      # Case management
│   │   │   ├── subscriptions.js  # Payment & subscriptions
│   │   │   └── admin.js      # Admin endpoints
│   │   ├── middleware/        # Custom Middleware
│   │   │   ├── auth.js       # JWT authentication
│   │   │   └── subscription.js  # Subscription checks
│   │   ├── services/         # External Services
│   │   │   └── paystack.js  # Payment gateway integration
│   │   └── server.js         # Main server file
│   ├── scripts/               # Utility Scripts
│   │   ├── create-admin.js   # Admin user creation
│   │   └── init-plans.js     # Initialize subscription plans
│   ├── Dockerfile            # Docker configuration
│   ├── package.json          # Backend dependencies
│   └── .env                  # Environment variables
│
├── frontend/                  # Next.js React Frontend
│   ├── components/           # React Components
│   │   └── ReportModal.tsx   # Incident reporting modal
│   ├── pages/               # Next.js Pages
│   │   ├── index.tsx        # Landing page
│   │   ├── login.tsx        # Login page
│   │   ├── register.tsx     # Registration page
│   │   ├── dashboard.tsx    # User dashboard
│   │   ├── subscription.tsx # Subscription management
│   │   └── admin/
│   │       └── dashboard.tsx # Admin dashboard
│   ├── utils/               # Utility Functions
│   │   └── auth.ts          # Authentication service
│   ├── styles/              # Styling
│   │   └── globals.css      # Global styles
│   ├── Dockerfile           # Docker configuration
│   ├── package.json         # Frontend dependencies
│   └── .env.local           # Environment variables
│
├── docs/                     # Documentation
│   ├── DEPLOYMENT.md        # Deployment guide
│   ├── SETUP.md             # Setup instructions
│   ├── PAYSTACK_INTEGRATION_GUIDE.md  # Payment integration
│   └── ...
│
└── README.md                # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** (local or MongoDB Atlas)
- **Git**
- **Paystack Account** (for payment integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/empowerher.git
   cd empowerher
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

#### Backend Configuration

1. **Create `.env` file in `backend/` directory**
   ```bash
   cd backend
   cp env.example .env
   ```

2. **Configure environment variables**
   ```env
   # Server
   NODE_ENV=development
   PORT=5000

   # Database
   MONGODB_URI=mongodb://localhost:27017/empowerher

   # JWT
   JWT_SECRET=your-super-secret-jwt-key

   # URLs
   FRONTEND_URL=http://localhost:3000
   BACKEND_URL=http://localhost:5000

   # Paystack Payment Gateway
   PAYSTACK_PUBLIC_KEY=pk_test_your-public-key
   PAYSTACK_SECRET_KEY=sk_test_your-secret-key
   PAYSTACK_WEBHOOK_SECRET=your-paystack-webhook-secret
   PAYSTACK_API_URL=https://api.paystack.co
   PAYSTACK_REDIRECT_URL=https://empowerher-frontend.vercel.app/payment-success
   ```

#### Frontend Configuration

1. **Create `.env.local` file in `frontend/` directory**
   ```bash
   cd frontend
   cp env.example .env.local
   ```

2. **Configure environment variables**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

### Database Setup

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

   Or use **MongoDB Atlas** (cloud):
   - Create account at https://www.mongodb.com/cloud/atlas
   - Create a cluster
   - Get connection string
   - Update `MONGODB_URI` in `.env`

2. **Initialize Database**
   ```bash
   cd backend
   npm run init-plans  # Initialize subscription plans
   npm run create-admin  # Create admin user (optional)
   ```

### Running the Application

#### Development Mode

**Terminal 1 - Backend Server**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend Server**
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

#### Production Mode

**Backend**
```bash
cd backend
npm start
```

**Frontend**
```bash
cd frontend
npm run build
npm start
```

### Access the Application

- **Frontend**: https://empowerher-frontend.vercel.app/
- **Backend API**: https://empowerher-backend-gs03.onrender.com
- **API Health Check**: https://empowerher-backend-gs03.onrender.com/api/health

---

## 📚 Documentation

### Available Documentation

- **[Setup Guide](SETUP.md)** - Detailed setup instructions
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment steps
- **[Paystack Integration Guide](PAYSTACK_INTEGRATION_GUIDE.md)** - Payment gateway setup
- **[Webhook Setup](WEBHOOK_CHALLENGE_SETUP.md)** - Webhook configuration

### API Documentation

#### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Report Endpoints

- `POST /api/reports` - Submit new report
- `GET /api/reports/user/my-reports` - Get user's reports
- `GET /api/reports/:id` - Get report details

#### Subscription Endpoints

- `GET /api/subscriptions/plans` - Get available plans
- `GET /api/subscriptions/my-subscription` - Get user subscription
- `POST /api/subscriptions/initiate-payment` - Initiate payment
- `POST /api/subscriptions/webhook` - Payment webhook (Paystack)

#### Admin Endpoints

- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/reports` - All reports
- `PUT /api/admin/cases/:id/status` - Update case status

---

## 🚢 Deployment

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Backend Deployment (Render)

1. Connect GitHub repository
2. Create new Web Service
3. Configure build and start commands
4. Add environment variables
5. Deploy

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

---

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt with salt rounds
- **Rate Limiting** - Prevent abuse and DDoS attacks
- **CORS Protection** - Configured allowed origins
- **Helmet.js** - Security headers
- **Input Validation** - Express Validator
- **Webhook Signature Verification** - Secure payment webhooks
- **Environment Variables** - Sensitive data protection

---

## 💳 Payment Integration

EmpowerHer uses **Paystack** for payment processing:

- **Card Payments** - Secure credit/debit card checkout
- **Hosted Checkout** - Paystack authorization page for subscribers
- **Webhook Integration** - Real-time payment notifications
- **Subscription Management** - Free and Premium plans

See [PAYSTACK_INTEGRATION_GUIDE.md](PAYSTACK_INTEGRATION_GUIDE.md) for setup instructions.

---

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm run lint
npm run type-check
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- **Backend**: Follow ESLint configuration
- **Frontend**: Follow Next.js and TypeScript best practices
- **Commits**: Use conventional commit messages

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Paystack** - Payment gateway integration
- **MongoDB Atlas** - Database hosting
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **Open Source Community** - Libraries and tools

---

## 📞 Support & Contact

- **Email**: ezragift51@gmail.com
- **Documentation**: See `/docs` directory
- **Issues**: GitHub Issues

---

## 🗺 Roadmap

### Upcoming Features

- [ ] Real-time notifications (Socket.io)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] SMS notifications integration
- [ ] Case file management system
- [ ] Police officer mobile app
- [ ] Automated report generation

---

<div align="center">

**EmpowerHer: Empowering Victims, Accelerating Justice** 🛡️

Made with ❤️ by the EmpowerHer Team

[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=flat-square&logo=github)](https://github.com/your-org/empowerher)
[![Documentation](https://img.shields.io/badge/Docs-Available-blue?style=flat-square)](./docs)

</div>
