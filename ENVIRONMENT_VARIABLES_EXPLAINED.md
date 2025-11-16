# Environment Variables Explained

## What are Environment Variables?

Environment variables are configuration values that your application uses but aren't hardcoded in your code. They're stored separately and can be different for development, testing, and production.

---

## The Three Variables Explained

### 1. `NEXT_PUBLIC_API_URL`

**What it is:**
- This tells your frontend (Next.js) where to find your backend API
- The `NEXT_PUBLIC_` prefix is required for Next.js to make this available in the browser

**Why you need it:**
- Your frontend needs to make API calls to your backend
- In development, it might be `http://localhost:5000/api`
- In production, it will be your deployed backend URL like `https://empowerher-backend.up.railway.app/api`

**How to set it:**
1. First, deploy your backend (Railway/Render)
2. Copy your backend URL (e.g., `https://empowerher-api.up.railway.app`)
3. Add `/api` at the end: `https://empowerher-api.up.railway.app/api`
4. Enter this in Vercel's environment variables

**Example:**
```
NEXT_PUBLIC_API_URL = https://empowerher-backend.up.railway.app/api
```

---

### 2. `NEXTAUTH_URL`

**What it is:**
- This is the public URL where your frontend is deployed
- NextAuth (authentication library) needs this to handle authentication correctly

**Why you need it:**
- After deploying to Vercel, Vercel will give you a URL like `https://empowerher-frontend.vercel.app`
- This URL tells NextAuth where your app is running so it can redirect users correctly

**How to set it:**
1. Deploy your frontend to Vercel
2. Vercel will show you a URL like `https://empowerher-frontend-abc123.vercel.app`
3. Copy this exact URL (without `/api` or anything else)
4. Enter it as `NEXTAUTH_URL`

**Example:**
```
NEXTAUTH_URL = https://empowerher-frontend.vercel.app
```

**Note:** You might need to update this after deployment, or you can set it temporarily and update it once you know the final URL.

---

### 3. `NEXTAUTH_SECRET`

**What it is:**
- This is a secret key used to encrypt authentication tokens and sessions
- It must be random and secret (never share it publicly)

**Why you need it:**
- NextAuth uses this to sign and encrypt cookies and tokens
- Without it, authentication won't work securely

**How to generate it:**

**Option 1: Using PowerShell (Windows)**
1. Open PowerShell
2. Run this command:
   ```powershell
   [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
   ```
3. Copy the output (it will be a long string like `k8j3h2k3j2h3k2j3h2k3j2h3k2j3h2k3j2h3k2j3h=`)
4. Use this as your `NEXTAUTH_SECRET`

**Option 2: Using Online Generator**
- Go to: https://generate-secret.vercel.app/32
- Copy the generated secret

**Option 3: Using Node.js (if you have it)**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Example:**
```
NEXTAUTH_SECRET = k8j3h2k3j2h3k2j3h2k3j2h3k2j3h2k3j2h3k2j3h2k3j2h3k2j3h=
```

---

## How to Add Environment Variables in Vercel

### Step-by-Step:

1. **Deploy your project first** (even without variables, it will partially work)
2. **Go to your project dashboard** on Vercel
3. **Click on "Settings"** (top menu)
4. **Click on "Environment Variables"** (left sidebar)
5. **Click "Add New"** button
6. **For each variable:**
   - **Key**: Type the variable name (e.g., `NEXT_PUBLIC_API_URL`)
   - **Value**: Type or paste the value (e.g., `https://your-backend-url.com/api`)
   - **Environment**: Select "Production" (or "Production, Preview, Development" for all environments)
   - Click **"Save"**
7. **After adding all variables, you need to redeploy:**
   - Go to "Deployments" tab
   - Click the three dots (⋯) on the latest deployment
   - Click "Redeploy"

---

## Order of Operations

### Recommended Sequence:

1. **Deploy Frontend to Vercel** (without environment variables first - just to get the URL)
2. **Note your Vercel URL** (e.g., `https://empowerher-frontend.vercel.app`)
3. **Deploy Backend to Railway/Render**
4. **Note your Backend URL** (e.g., `https://empowerher-backend.up.railway.app`)
5. **Go back to Vercel and add environment variables:**
   - `NEXT_PUBLIC_API_URL`: `https://empowerher-backend.up.railway.app/api`
   - `NEXTAUTH_URL`: `https://empowerher-frontend.vercel.app`
   - `NEXTAUTH_SECRET`: `[generated secret]`
6. **Redeploy frontend** in Vercel

---

## Quick Reference Table

| Variable | Example Value | When to Set |
|----------|---------------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://empowerher-backend.up.railway.app/api` | After backend is deployed |
| `NEXTAUTH_URL` | `https://empowerher-frontend.vercel.app` | After frontend is deployed |
| `NEXTAUTH_SECRET` | `k8j3h2k3j2h3k2j3h2k3j2h3k2j3h2k3j2h3k2j3h=` | Generate immediately (can be done anytime) |

---

## Troubleshooting

### "Variable not working"
- Make sure variable name starts with `NEXT_PUBLIC_` if you need it in the browser
- Redeploy after adding/updating variables
- Check for typos in variable names

### "API calls failing"
- Verify `NEXT_PUBLIC_API_URL` includes `/api` at the end
- Check that backend URL is correct (no typos)
- Ensure backend is actually deployed and running

### "Authentication not working"
- Make sure `NEXTAUTH_URL` matches your exact frontend URL
- Verify `NEXTAUTH_SECRET` is set (not empty)
- Redeploy after adding these variables

