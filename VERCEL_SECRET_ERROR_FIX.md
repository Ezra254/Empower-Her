# Fix Vercel Secret Error

## The Error

```
Environment Variable "NEXT_PUBLIC_API_URL" references Secret "next_public_api_url", which does not exist.
```

## What Happened

The `vercel.json` file was trying to reference Vercel Secrets (using `@secret-name` syntax), but those secrets don't exist in your Vercel account.

## The Fix

I've removed the problematic `env` section from `vercel.json`. You should **set environment variables directly in Vercel's dashboard** instead.

---

## ✅ Correct Way to Add Environment Variables in Vercel

**Don't use secrets in vercel.json.** Instead, use Vercel's dashboard:

### Step-by-Step:

1. **Go to your Vercel project**
2. **Click "Settings"** (top menu)
3. **Click "Environment Variables"** (left sidebar)
4. **Click "Add New"** button
5. **For each variable, add it directly:**
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-backend-url.com/api` (type the actual URL)
   - **Environment**: Select "Production" (or all environments)
   - **Click "Save"**

6. **Repeat for each variable:**
   - `NEXT_PUBLIC_API_URL` = `https://your-backend-url.com/api`
   - `NEXT_PUBLIC_APP_NAME` = `EmpowerHer`
   - `NEXT_PUBLIC_APP_VERSION` = `1.0.0`
   - `NEXTAUTH_URL` = `https://your-frontend-url.vercel.app`
   - `NEXTAUTH_SECRET` = `[your-generated-secret]`

7. **Redeploy your project:**
   - Go to "Deployments" tab
   - Click the three dots (⋯) on the latest deployment
   - Click "Redeploy"

---

## Difference Between Secrets and Environment Variables

### Environment Variables (What You Should Use)
- **Where**: Vercel Dashboard → Settings → Environment Variables
- **How**: Type the value directly
- **Use for**: Normal configuration values (URLs, API keys, etc.)

### Vercel Secrets (Advanced - Not Needed Here)
- **Where**: Vercel Dashboard → Settings → Secrets
- **How**: Create secret, then reference with `@secret-name` in vercel.json
- **Use for**: Sensitive values that you want to reuse across multiple projects

**For now, just use Environment Variables in the dashboard** - it's simpler and works perfectly!

---

## After Fixing

1. **The error should be gone** after removing the `env` section from vercel.json
2. **Add your environment variables** in Vercel dashboard (Settings → Environment Variables)
3. **Redeploy** your project

---

## Quick Reference

**Set these in Vercel Dashboard → Settings → Environment Variables:**

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-url.com/api` | After backend is deployed |
| `NEXT_PUBLIC_APP_NAME` | `EmpowerHer` | Optional |
| `NEXT_PUBLIC_APP_VERSION` | `1.0.0` | Optional |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Your Vercel URL |
| `NEXTAUTH_SECRET` | `[generated-secret]` | Generate with PowerShell command |

That's it! The vercel.json file is now fixed and won't cause this error anymore.

