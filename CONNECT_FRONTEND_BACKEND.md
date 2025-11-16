# Connect Frontend and Backend - Step by Step

## Your Deployed URLs

- **Frontend**: https://empowerher-frontend.vercel.app/
- **Backend**: https://empowerher-backend-gs03.onrender.com

---

## Step 1: Update Frontend Environment Variables (Vercel)

Your frontend needs to know where your backend API is located.

### Steps:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your project: `empowerher-frontend` (or whatever you named it)

2. **Navigate to Settings**
   - Click "Settings" in the top menu
   - Click "Environment Variables" in the left sidebar

3. **Add/Update Environment Variables**

   Click "Add New" for each variable:

   | Variable Name | Value | Environment |
   |--------------|-------|-------------|
   | `NEXT_PUBLIC_API_URL` | `https://empowerher-backend-gs03.onrender.com/api` | Production (and Preview if needed) |
   | `NEXTAUTH_URL` | `https://empowerher-frontend.vercel.app` | Production (and Preview if needed) |
   | `NEXTAUTH_SECRET` | `[your-generated-secret]` | Production (and Preview if needed) |
   | `NEXT_PUBLIC_APP_NAME` | `EmpowerHer` | Production (optional) |
   | `NEXT_PUBLIC_APP_VERSION` | `1.0.0` | Production (optional) |

   **Important Notes:**
   - For `NEXT_PUBLIC_API_URL`: Add `/api` at the end of your backend URL
   - For `NEXTAUTH_URL`: Use your exact Vercel URL (without trailing slash)
   - For `NEXTAUTH_SECRET`: If you haven't generated one yet, use PowerShell:
     ```powershell
     [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
     ```

4. **After Adding Variables**
   - Make sure each variable has the correct "Environment" selected (Production, Preview, Development)
   - Click "Save" for each variable

5. **Redeploy Frontend**
   - Go to "Deployments" tab
   - Click the three dots (⋯) on the latest deployment
   - Click "Redeploy"
   - Wait for deployment to complete

---

## Step 2: Update Backend Environment Variables (Render)

Your backend needs to allow CORS requests from your frontend and know its own URL.

### Steps:

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click on your web service: `empowerher-backend-gs03` (or your service name)

2. **Navigate to Environment**
   - Click "Environment" in the left sidebar

3. **Add/Update Environment Variables**

   Add or update these variables:

   | Variable Name | Value |
   |--------------|-------|
   | `FRONTEND_URL` | `https://empowerher-frontend.vercel.app` |
   | `BACKEND_URL` | `https://empowerher-backend-gs03.onrender.com` |
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | `[your-mongodb-atlas-connection-string]` |
   | `JWT_SECRET` | `[your-jwt-secret]` |
   | `INTASEND_PUBLIC_KEY` | `[your-intasend-public-key]` |
   | `INTASEND_SECRET_KEY` | `[your-intasend-secret-key]` |
   | `INTASEND_WEBHOOK_SECRET` | `[your-webhook-secret]` |
   | `SESSION_SECRET` | `[your-session-secret]` |
   | `EMAIL_HOST` | `smtp.gmail.com` |
   | `EMAIL_PORT` | `587` |
   | `EMAIL_USER` | `[your-email]` |
   | `EMAIL_PASS` | `[your-email-app-password]` |

   **Important Notes:**
   - `FRONTEND_URL` should match your Vercel URL exactly (without trailing slash)
   - `BACKEND_URL` should match your Render URL exactly (without trailing slash)
   - Make sure all other required variables are set (check `backend/env.production.example`)

4. **Save Changes**
   - Click "Save Changes" button
   - Render will automatically redeploy your service

5. **Wait for Redeployment**
   - Check the "Logs" tab to see deployment progress
   - Wait for "Build successful" message

---

## Step 3: Verify the Connection

### Test Backend Health

1. **Open your browser** and visit:
   ```
   https://empowerher-backend-gs03.onrender.com/api/health
   ```

   You should see:
   ```json
   {
     "status": "OK",
     "timestamp": "...",
     "version": "1.0.0",
     "database": "connected"
   }
   ```

   ✅ If you see this, your backend is running correctly.

### Test Frontend Connection

1. **Visit your frontend**:
   ```
   https://empowerher-frontend.vercel.app
   ```

2. **Open Browser Developer Tools**:
   - Press `F12` or `Right-click → Inspect`
   - Go to the "Console" tab
   - Go to the "Network" tab

3. **Try to use the app**:
   - Try to register or login
   - Watch the Network tab for API requests
   - Check if requests go to: `https://empowerher-backend-gs03.onrender.com/api/...`

4. **Check for Errors**:
   - In Console tab, look for any red error messages
   - Common errors:
     - **CORS errors**: Backend `FRONTEND_URL` not set correctly
     - **404 errors**: `NEXT_PUBLIC_API_URL` not set correctly
     - **Connection errors**: Backend might be down or URL wrong

---

## Step 4: Fix Common Issues

### Issue 1: CORS Errors

**Error in browser console:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Solution:**
- Check that `FRONTEND_URL` in Render matches exactly: `https://empowerher-frontend.vercel.app`
- Make sure there's no trailing slash
- Redeploy backend after updating

### Issue 2: API Requests Failing (404)

**Error:**
```
Failed to fetch
404 Not Found
```

**Solution:**
- Check that `NEXT_PUBLIC_API_URL` in Vercel is: `https://empowerher-backend-gs03.onrender.com/api`
- Make sure it includes `/api` at the end
- Redeploy frontend after updating

### Issue 3: Authentication Not Working

**Error:**
```
Authentication failed
Token invalid
```

**Solution:**
- Make sure `NEXTAUTH_SECRET` is set in Vercel
- Make sure `JWT_SECRET` is set in Render
- Generate new secrets if needed and redeploy both

### Issue 4: Database Connection Issues

**Backend logs show:**
```
MongoDB connection error
```

**Solution:**
- Check `MONGODB_URI` in Render is correct
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0` (all IPs)
- Check MongoDB Atlas connection string format

---

## Step 5: Test Full Functionality

### Test Authentication

1. **Visit**: https://empowerher-frontend.vercel.app/register
2. **Create a new account**
3. **Check if registration succeeds**
4. **Try to login**

### Test API Endpoints

1. **Register a user** through the frontend
2. **Login** through the frontend
3. **Submit a report** (if you have that feature)
4. **Check your backend logs** in Render to see if requests are coming through

### Test Admin Functions (if applicable)

1. **Login as admin** (if you have admin account)
2. **Check admin dashboard** loads correctly
3. **Verify admin functions work**

---

## Quick Reference

### Frontend Environment Variables (Vercel)
```
NEXT_PUBLIC_API_URL=https://empowerher-backend-gs03.onrender.com/api
NEXTAUTH_URL=https://empowerher-frontend.vercel.app
NEXTAUTH_SECRET=[your-secret]
```

### Backend Environment Variables (Render)
```
FRONTEND_URL=https://empowerher-frontend.vercel.app
BACKEND_URL=https://empowerher-backend-gs03.onrender.com
MONGODB_URI=[your-mongodb-atlas-uri]
JWT_SECRET=[your-secret]
NODE_ENV=production
```

### Test URLs
- **Frontend**: https://empowerher-frontend.vercel.app
- **Backend Health**: https://empowerher-backend-gs03.onrender.com/api/health
- **Backend API**: https://empowerher-backend-gs03.onrender.com/api

---

## After Everything Works

1. ✅ Test all major features
2. ✅ Check browser console for errors
3. ✅ Monitor Render logs for any backend errors
4. ✅ Verify database connections work
5. ✅ Test on mobile devices if needed

---

## Need Help?

If you encounter issues:

1. **Check Vercel Deployment Logs**: Vercel Dashboard → Deployments → Latest → Logs
2. **Check Render Logs**: Render Dashboard → Your Service → Logs
3. **Check Browser Console**: F12 → Console tab
4. **Check Network Tab**: F12 → Network tab → Look for failed requests

Common fixes:
- Ensure all environment variables are set correctly
- Redeploy both frontend and backend after changes
- Wait for deployments to complete before testing
- Check for typos in URLs (no trailing slashes, correct `/api` path)

---

**Your app should now be fully connected!** 🎉

Visit https://empowerher-frontend.vercel.app and start testing!

