# EmpowerHer Deployment Guide

This guide covers deploying the EmpowerHer application's frontend and backend on different platforms.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Frontend Deployment](#frontend-deployment)
   - [Vercel](#vercel-frontend)
   - [Netlify](#netlify-frontend)
   - [Docker](#docker-frontend)
4. [Backend Deployment](#backend-deployment)
   - [Railway](#railway-backend)
   - [Render](#render-backend)
   - [DigitalOcean](#digitalocean-backend)
   - [Docker](#docker-backend)
5. [Environment Variables](#environment-variables)
6. [Database Setup](#database-setup)
7. [Troubleshooting](#troubleshooting)

---

## Overview

EmpowerHer consists of:
- **Frontend**: Next.js application (port 3000)
- **Backend**: Express.js API (port 5000)
- **Database**: MongoDB

These can be deployed separately on different platforms for flexibility and cost optimization.

---

## Prerequisites

- Git repository access
- Accounts on chosen deployment platforms
- MongoDB Atlas account (recommended for production) or self-hosted MongoDB
- Domain names (optional but recommended)

---

## Frontend Deployment

### Vercel (Frontend)

**Recommended for Next.js applications**

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Import your Git repository
   - Set Root Directory to `frontend`
   - Configure environment variables (see [Environment Variables](#environment-variables))

3. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL (e.g., `https://api.empowerher.com/api`)
   - `NEXT_PUBLIC_APP_NAME`: `EmpowerHer`
   - `NEXT_PUBLIC_APP_VERSION`: `1.0.0`
   - `NEXTAUTH_URL`: Your Vercel deployment URL
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`

4. **Deploy via CLI**:
   ```bash
   cd frontend
   vercel
   ```

5. **Custom Domain** (optional):
   - Add your domain in Vercel dashboard
   - Update DNS records as instructed
   - Update `NEXTAUTH_URL` and `NEXT_PUBLIC_API_URL` accordingly

---

### Netlify (Frontend)

**Alternative platform with good Next.js support**

1. **Deploy via Dashboard**:
   - Go to [netlify.com](https://netlify.com)
   - Import your Git repository
   - Configure build settings:
     - **Base directory**: `frontend`
     - **Build command**: `npm run build`
     - **Publish directory**: `.next`

2. **Install Netlify Next.js Plugin**:
   The `netlify.toml` file is already configured with `@netlify/plugin-nextjs`

3. **Environment Variables**:
   Add all environment variables in Netlify dashboard under Site Settings → Environment Variables

4. **Deploy via CLI**:
   ```bash
   npm install -g netlify-cli
   cd frontend
   netlify deploy --prod
   ```

---

### Docker (Frontend)

**For containerized deployments**

1. **Build the image**:
   ```bash
   cd frontend
   docker build -t empowerher-frontend \
     --build-arg NEXT_PUBLIC_API_URL=https://your-backend-url.com/api \
     --build-arg NEXTAUTH_URL=https://your-frontend-url.com \
     --build-arg NEXTAUTH_SECRET=your-secret-key \
     .
   ```

2. **Run the container**:
   ```bash
   docker run -d -p 3000:3000 \
     -e NEXT_PUBLIC_API_URL=https://your-backend-url.com/api \
     -e NEXTAUTH_URL=https://your-frontend-url.com \
     -e NEXTAUTH_SECRET=your-secret-key \
     --name empowerher-frontend \
     empowerher-frontend
   ```

3. **Using Docker Compose**:
   ```bash
   # From project root
   docker-compose up -d frontend
   ```

---

## Backend Deployment

### Railway (Backend)

**Recommended for Node.js backends**

1. **Deploy via Dashboard**:
   - Go to [railway.app](https://railway.app)
   - New Project → Deploy from GitHub repo
   - Select the repository
   - Set Root Directory to `backend`

2. **Environment Variables**:
   Add all required environment variables (see [Environment Variables](#environment-variables))
   - Railway will automatically expose `PORT` environment variable
   - Set `PORT` to use Railway's assigned port

3. **Database**:
   - Add MongoDB service in Railway dashboard, OR
   - Use MongoDB Atlas connection string in `MONGODB_URI`

4. **Deploy**:
   - Railway automatically detects Node.js and runs `npm start`
   - Your API will be available at the generated Railway URL

5. **Custom Domain**:
   - Add custom domain in Railway dashboard
   - Update CORS settings in backend to include your frontend domain

---

### Render (Backend)

**Alternative platform with free tier**

1. **Deploy via Dashboard**:
   - Go to [render.com](https://render.com)
   - New → Web Service
   - Connect your GitHub repository
   - Configure:
     - **Name**: `empowerher-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

2. **Environment Variables**:
   The `render.yaml` file is pre-configured. Add environment variables in Render dashboard:
   - Go to Environment tab
   - Add all variables listed in `backend/env.example`

3. **Database**:
   - Use MongoDB Atlas (recommended), OR
   - Add MongoDB service in Render (paid)

4. **Auto-Deploy**:
   - Render automatically deploys on git push to main branch
   - Check logs in Render dashboard for deployment status

---

### DigitalOcean (Backend)

**For App Platform or Droplets**

#### Option 1: App Platform

1. **Create App**:
   - Go to DigitalOcean App Platform
   - Create → GitHub → Select repository
   - Configure:
     - **Type**: Web Service
     - **Root Directory**: `backend`
     - **Build Command**: `npm install`
     - **Run Command**: `npm start`

2. **Environment Variables**:
   Add all required environment variables in the app settings

3. **Database**:
   - Use MongoDB Atlas, OR
   - Add managed MongoDB database in DigitalOcean

#### Option 2: Droplet (Docker)

1. **Create Droplet**:
   - Create Ubuntu Droplet
   - SSH into the droplet

2. **Install Docker**:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

3. **Deploy**:
   ```bash
   git clone <your-repo-url>
   cd "Empower her"
   docker-compose up -d backend mongodb
   ```

---

### Docker (Backend)

**For any container platform**

1. **Build the image**:
   ```bash
   cd backend
   docker build -t empowerher-backend .
   ```

2. **Run the container**:
   ```bash
   docker run -d -p 5000:5000 \
     -e NODE_ENV=production \
     -e PORT=5000 \
     -e MONGODB_URI=mongodb://mongodb:27017/empowerher \
     -e JWT_SECRET=your-jwt-secret \
     -e FRONTEND_URL=https://your-frontend-url.com \
     -e BACKEND_URL=https://your-backend-url.com \
     --name empowerher-backend \
     empowerher-backend
   ```

3. **Using Docker Compose**:
   ```bash
   # From project root
   docker-compose up -d backend mongodb
   ```

---

## Environment Variables

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.empowerher.com/api` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `EmpowerHer` |
| `NEXT_PUBLIC_APP_VERSION` | App version | `1.0.0` |
| `NEXTAUTH_URL` | Frontend URL | `https://empowerher.com` |
| `NEXTAUTH_SECRET` | NextAuth secret key | Generate with `openssl rand -base64 32` |

### Backend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment | Yes | `production` |
| `PORT` | Server port | Yes | `5000` |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `FRONTEND_URL` | Frontend URL for CORS | Yes | - |
| `BACKEND_URL` | Backend URL | Yes | - |
| `INTASEND_PUBLIC_KEY` | IntaSend public key | Yes | - |
| `INTASEND_SECRET_KEY` | IntaSend secret key | Yes | - |
| `INTASEND_WEBHOOK_SECRET` | Webhook secret | Yes | - |
| `EMAIL_HOST` | SMTP host | No | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | No | `587` |
| `EMAIL_USER` | SMTP user | No | - |
| `EMAIL_PASS` | SMTP password | No | - |

**Generate Secrets**:
```bash
# JWT Secret
openssl rand -base64 32

# NextAuth Secret
openssl rand -base64 32

# Session Secret
openssl rand -base64 32
```

---

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create Cluster**:
   - Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
   - Create free cluster
   - Choose region closest to your deployment

2. **Database Access**:
   - Create database user
   - Set username and password
   - Save credentials securely

3. **Network Access**:
   - Add IP address: `0.0.0.0/0` (for all IPs)
   - Or add specific deployment platform IPs

4. **Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
   - Update `MONGODB_URI` in backend environment variables

5. **Initialize Database**:
   ```bash
   # After first deployment, run initialization scripts
   cd backend
   npm run create-admin
   npm run init-plans
   ```

---

## Troubleshooting

### Frontend Issues

**Build Failures**:
- Check Node.js version (requires 18+)
- Verify all environment variables are set
- Check `next.config.js` for correct configuration

**API Connection Errors**:
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is deployed and accessible

**Environment Variables Not Working**:
- Next.js requires `NEXT_PUBLIC_` prefix for client-side variables
- Rebuild after changing environment variables
- Check variable names for typos

### Backend Issues

**Database Connection Errors**:
- Verify MongoDB URI is correct
- Check network access in MongoDB Atlas
- Ensure database user has proper permissions

**Port Already in Use**:
- Change `PORT` environment variable
- Kill existing process: `npm run kill-port` (Windows)

**CORS Errors**:
- Update `FRONTEND_URL` in backend environment variables
- Check CORS configuration in `server.js`

**File Upload Issues**:
- Ensure uploads directory exists and has write permissions
- Check `MAX_FILE_SIZE` limit
- Verify storage persistence (use volumes in Docker)

### Deployment Platform Specific

**Railway**:
- Check logs in Railway dashboard
- Verify `PORT` environment variable matches Railway's assignment
- Ensure root directory is set to `backend`

**Render**:
- Check build logs for errors
- Verify `render.yaml` configuration
- Ensure all environment variables are set

**Vercel**:
- Check function logs for server-side errors
- Verify environment variables are set for production
- Check Next.js configuration for compatibility

---

## Best Practices

1. **Security**:
   - Never commit `.env` files
   - Use strong, randomly generated secrets
   - Enable HTTPS for all deployments
   - Regularly rotate secrets

2. **Performance**:
   - Use CDN for frontend static assets
   - Enable compression in backend
   - Use MongoDB connection pooling
   - Implement caching where appropriate

3. **Monitoring**:
   - Set up error tracking (Sentry, LogRocket)
   - Monitor API response times
   - Set up uptime monitoring
   - Review logs regularly

4. **Backup**:
   - Regular MongoDB backups
   - Version control all code
   - Document environment variables
   - Keep deployment documentation updated

---

## Quick Reference

### Frontend URLs by Platform

- **Vercel**: `https://your-app.vercel.app`
- **Netlify**: `https://your-app.netlify.app`
- **Custom Domain**: `https://your-domain.com`

### Backend URLs by Platform

- **Railway**: `https://your-app.up.railway.app`
- **Render**: `https://your-app.onrender.com`
- **DigitalOcean**: `https://your-app.ondigitalocean.app`
- **Custom Domain**: `https://api.your-domain.com`

### Health Check Endpoints

- Backend: `GET https://your-backend-url.com/api/health`
- Frontend: `GET https://your-frontend-url.com`

---

## Support

For deployment issues:
1. Check platform-specific documentation
2. Review logs in deployment dashboard
3. Verify environment variables are set correctly
4. Test API endpoints independently

---

**Last Updated**: December 2024


