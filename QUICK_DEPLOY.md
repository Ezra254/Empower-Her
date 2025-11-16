# Quick Deployment Guide - EmpowerHer

This guide provides step-by-step instructions to deploy your frontend and backend on different platforms.

## 🚨 Important: Fix Git Issue First

Before deploying, you need to fix the Git issue with large files in `node_modules`. The file `frontend/node_modules/@next/swc-win32-x64-msvc/next-swc.win32-x64-msvc.node` (123.96 MB) is too large for GitHub.

### Fix the Git Issue

1. **Remove node_modules from Git** (if already committed):
   ```bash
   git rm -r --cached frontend/node_modules
   git rm -r --cached backend/node_modules
   git rm -r --cached node_modules
   ```

2. **Verify .gitignore** - Make sure `node_modules/` is in `.gitignore` (already done)

3. **Commit the changes**:
   ```bash
   git add .gitignore
   git commit -m "Remove node_modules from Git tracking"
   ```

4. **Push to GitHub**:
   ```bash
   git push origin main
   ```

---

## 📦 Frontend Deployment

### Option 1: Deploy to Vercel (Recommended for Next.js)

**Time: ~5 minutes**

1. **Sign up/Login**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub account

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Import your Git repository
   - **Important**: Set "Root Directory" to `frontend`

3. **Configure Environment Variables**:
   - In project settings, go to "Environment Variables"
   - Add these variables:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
     NEXT_PUBLIC_APP_NAME=EmpowerHer
     NEXT_PUBLIC_APP_VERSION=1.0.0
     NEXTAUTH_URL=https://your-app.vercel.app
     NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
     ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-app.vercel.app`

5. **Get Your Frontend URL**:
   - Copy the deployment URL from Vercel dashboard
   - You'll need this for backend CORS configuration

---

### Option 2: Deploy to Netlify

**Time: ~5 minutes**

1. **Sign up/Login**:
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub account

2. **Import Project**:
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub and select your repository
   - Configure:
     - **Base directory**: `frontend`
     - **Build command**: `npm run build`
     - **Publish directory**: `.next`

3. **Set Environment Variables**:
   - Go to Site settings → Environment variables
   - Add the same variables as Vercel above

4. **Deploy**:
   - Click "Deploy site"
   - Your app will be live at `https://your-app.netlify.app`

---

## 🔧 Backend Deployment

### Option 1: Deploy to Railway (Recommended)

**Time: ~10 minutes**

1. **Sign up/Login**:
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub account

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Service**:
   - Railway should auto-detect Node.js
   - **Important**: In Settings → Root Directory, set to `backend`
   - In Settings → Start Command, ensure it's `npm start`

4. **Set Environment Variables**:
   - Go to Variables tab
   - Add these required variables:
     ```
     NODE_ENV=production
     PORT=5000
     MONGODB_URI=<your-mongodb-atlas-connection-string>
     JWT_SECRET=<generate with: openssl rand -base64 32>
     FRONTEND_URL=https://your-frontend-url.com
     BACKEND_URL=https://your-backend-url.railway.app
     INTASEND_PUBLIC_KEY=<your-intasend-public-key>
     INTASEND_SECRET_KEY=<your-intasend-secret-key>
     INTASEND_WEBHOOK_SECRET=<generate-secret>
     INTASEND_API_URL=https://api.intasend.com
     INTASEND_TEST_MODE=false
     EMAIL_HOST=smtp.gmail.com
     EMAIL_PORT=587
     EMAIL_USER=<your-email>
     EMAIL_PASS=<your-app-password>
     SESSION_SECRET=<generate with: openssl rand -base64 32>
     ```
   - **Note**: Railway auto-assigns PORT, but you can keep PORT=5000 for reference

5. **Setup MongoDB Atlas** (if not done):
   - Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
   - Create free cluster
   - Create database user
   - Whitelist IP: `0.0.0.0/0` (all IPs) or add Railway's IPs
   - Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/empowerher`

6. **Deploy**:
   - Railway auto-deploys on git push
   - Check Deployments tab for status
   - Copy the generated URL (e.g., `https://your-app.up.railway.app`)

7. **Initialize Database** (after first deployment):
   - In Railway, go to your service
   - Open the terminal/console
   - Run:
     ```bash
     npm run create-admin
     npm run init-plans
     ```

---

### Option 2: Deploy to Render

**Time: ~10 minutes**

1. **Sign up/Login**:
   - Go to [render.com](https://render.com)
   - Sign up with GitHub account

2. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure Service**:
   - **Name**: `empowerher-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

4. **Set Environment Variables**:
   - Scroll down to "Environment Variables"
   - Add all the same variables as Railway (see above)
   - Render has a pre-configured `render.yaml` that includes defaults

5. **Deploy**:
   - Click "Create Web Service"
   - Render will build and deploy
   - Get your URL: `https://your-app.onrender.com`

6. **Initialize Database**:
   - Use Render shell to run initialization scripts:
     ```bash
     npm run create-admin
     npm run init-plans
     ```

---

## 🔗 Connect Frontend to Backend

After deploying both:

1. **Update Frontend Environment Variables**:
   - Go to your frontend deployment platform (Vercel/Netlify)
   - Update `NEXT_PUBLIC_API_URL` to your backend URL:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
     ```
   - Update `NEXTAUTH_URL` to your frontend URL:
     ```
     NEXTAUTH_URL=https://your-frontend-url.com
     ```

2. **Update Backend Environment Variables**:
   - Go to your backend deployment platform (Railway/Render)
   - Update `FRONTEND_URL` to your frontend URL:
     ```
     FRONTEND_URL=https://your-frontend-url.com
     ```
   - Update `BACKEND_URL` to your backend URL:
     ```
     BACKEND_URL=https://your-backend-url.com
     ```

3. **Redeploy**:
   - Both platforms auto-redeploy when environment variables change
   - Or manually trigger redeployment

---

## ✅ Verify Deployment

### Test Frontend:
- Visit your frontend URL
- Check if the page loads
- Try logging in (if database is set up)

### Test Backend:
- Visit: `https://your-backend-url.com/api/health`
- Should return: `{"status":"OK","timestamp":"...","version":"1.0.0","database":"connected"}`

### Test Connection:
- Visit frontend and try to register/login
- Check browser console for any API errors
- Verify API calls are going to correct backend URL

---

## 🐛 Troubleshooting

### Frontend Build Fails:
- Check build logs in deployment platform
- Verify all environment variables are set
- Ensure `node_modules` is not in Git

### Backend Deployment Fails:
- Check deployment logs
- Verify all environment variables are set
- Check MongoDB connection string is correct
- Verify PORT is set correctly

### CORS Errors:
- Update `FRONTEND_URL` in backend environment variables
- Ensure frontend URL includes `https://` protocol
- Redeploy backend after changing CORS settings

### Database Connection Errors:
- Verify MongoDB Atlas connection string
- Check IP whitelist in MongoDB Atlas (should include `0.0.0.0/0`)
- Verify database username and password are correct
- Check deployment logs for specific error messages

### API Not Responding:
- Check backend logs in deployment platform
- Verify backend is running (check health endpoint)
- Check if backend URL is accessible
- Verify `NEXT_PUBLIC_API_URL` in frontend matches backend URL

---

## 📝 Next Steps

1. **Set up Custom Domains** (optional):
   - Add custom domain in both platforms
   - Update DNS records
   - Update environment variables with new domains

2. **Enable HTTPS**:
   - Usually automatic on Vercel, Netlify, Railway, Render
   - Verify SSL certificate is active

3. **Set up Monitoring**:
   - Enable error tracking (Sentry, LogRocket)
   - Set up uptime monitoring
   - Configure alerts

4. **Backup Database**:
   - Enable MongoDB Atlas backups
   - Set up regular database exports

---

## 🎯 Recommended Deployment Setup

**For Production:**
- **Frontend**: Vercel (best Next.js support)
- **Backend**: Railway (easy setup, good free tier)
- **Database**: MongoDB Atlas (managed, free tier available)

**For Development/Testing:**
- **Frontend**: Netlify (generous free tier)
- **Backend**: Render (free tier available)
- **Database**: MongoDB Atlas free tier

---

## 📞 Quick Commands Reference

### Generate Secrets:
```bash
# Windows PowerShell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Or use OpenSSL (if installed)
openssl rand -base64 32
```

### Test Backend Health:
```bash
curl https://your-backend-url.com/api/health
```

### Check Deployment Status:
- **Vercel**: Dashboard → Deployments
- **Railway**: Dashboard → Deployments
- **Render**: Dashboard → Logs

---

**Need Help?** Check the detailed [DEPLOYMENT.md](./DEPLOYMENT.md) guide for more information.

