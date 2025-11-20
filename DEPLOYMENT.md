# Deployment Guide

This guide walks through deploying EmpowerHer with:

- **Backend** on [Render](https://render.com)
- **Frontend** on [Vercel](https://vercel.com)

Follow the steps below to configure environments, set build commands, and verify each deployment.

---

## 1. Prerequisites

- GitHub repository with the latest EmpowerHer code
- Render account (with billing enabled for persistent services)
- Vercel account
- MongoDB Atlas cluster (or another hosted MongoDB instance)
- Paystack API keys (test or live)
- Email credentials (if email notifications are enabled)

---

## 2. Repository Preparation

1. Ensure `backend/env.example` and `frontend/env.example` reflect every environment variable you will set in production.
2. Commit and push any pending changes to the default branch (e.g., `main`).
3. Tag a release if you want an immutable reference for production deployments.

---

## 3. Backend Deployment (Render)

### 3.1 Create the Web Service

1. Log in to Render and click **New → Web Service**.
2. Connect your GitHub account and select the EmpowerHer repository.
3. Choose the branch to deploy from (typically `main`).
4. Use these settings:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Pick a size that matches expected traffic (e.g., Starter).

### 3.2 Configure Environment Variables

Add the following keys under **Environment → Environment Variables** (values depend on your infra):

| Variable | Description |
| --- | --- |
| `NODE_ENV` | `production` |
| `PORT` | `10000` (or default Render port) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Strong secret for signing tokens |
| `FRONTEND_URL` | Public Vercel URL, e.g., `https://empowerher.vercel.app` |
| `BACKEND_URL` | Render service URL, e.g., `https://empowerher-backend.onrender.com` |
| `PAYSTACK_PUBLIC_KEY` | Paystack publishable key |
| `PAYSTACK_SECRET_KEY` | Paystack secret key |
| `PAYSTACK_WEBHOOK_SECRET` | Paystack webhook signing secret |
| `PAYSTACK_API_URL` | Usually `https://api.paystack.co` |
| `PAYSTACK_REDIRECT_URL` | `https://empowerher.vercel.app/subscription` |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` | SMTP credentials if used |
| `POLICE_API_URL`, `POLICE_API_KEY` | Upstream integration config (optional) |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS` | Rate limiter tuning |
| `SESSION_SECRET`, `BCRYPT_ROUNDS` | Security-related settings |

> Tip: use Render's **Secret Files** if you prefer to upload a ready-made `.env`.

### 3.3 Deploy & Verify

1. Click **Create Web Service**. Render installs dependencies, builds, and starts the API.
2. After deployment succeeds:
   - Hit the `/api/health` endpoint to confirm the service is reachable.
   - Run through critical flows (login, creating a case, starting a subscription).
3. Configure autoscaling, cron jobs, or log drains as needed in Render's dashboard.

---

## 4. Frontend Deployment (Vercel)

### 4.1 Import Project

1. Log in to Vercel and click **New Project**.
2. Import the EmpowerHer repository.
3. Pick the branch to deploy (`main`).
4. Vercel auto-detects Next.js; default build settings work:
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`
   - **Output Directory**: `.next`

### 4.2 Environment Variables

Under **Project Settings → Environment Variables**, add at least:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend REST base, e.g., `https://empowerher-backend.onrender.com/api` |
| `NEXT_PUBLIC_APP_NAME` | Optional branding string |
| `NEXT_PUBLIC_APP_VERSION` | Optional version tag |

> Any variable prefixed with `NEXT_PUBLIC_` will be exposed to the browser.

Deployments are environment-specific. Set the variables for **Production** and (optionally) **Preview/Development**.

### 4.3 Deploy & Verify

1. Click **Deploy** and wait for the build to finish.
2. Visit the Vercel-provided URL and ensure:
   - API calls succeed (subscription plans load, login works).
   - Paystack checkout opens correctly from the subscription page.
3. Configure a custom domain if desired (Settings → Domains).

---

## 5. Post-Deployment Checklist

- [ ] Confirm HTTPS certificates (Render + Vercel) are valid.
- [ ] Create a Paystack webhook pointing to `https://<backend>/api/subscriptions/webhook`.
- [ ] Add monitoring/alerting (Render health notifications, Vercel checks).
- [ ] Set up backups for MongoDB Atlas.
- [ ] Document release version and changelog.

---

## 6. Rolling Out Updates

1. Merge changes into the tracked branch (`main`).
2. Render and Vercel automatically redeploy if auto-deploy is enabled; otherwise, trigger manual deploys.
3. Watch build logs for errors (e.g., TypeScript issues on the frontend).
4. After deployment completes, run a smoke test against both environments.

---

With these steps, EmpowerHer will run with the backend on Render and the frontend on Vercel, each pulling the correct environment configuration for Paystack payments and MongoDB. Keep this guide in sync whenever new services or env vars are introduced.


