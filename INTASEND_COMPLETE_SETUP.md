# Complete IntaSend Setup Guide

## Your Deployment URLs

- **Frontend**: https://empowerher-frontend.vercel.app
- **Backend**: https://empowerher-backend-gs03.onrender.com
- **Webhook URL**: https://empowerher-backend-gs03.onrender.com/api/subscriptions/webhook

---

## Step 1: Configure Backend Environment Variables (Render)

You already have your Public Key and Secret Key. Now let's set them up in Render.

### Steps:

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click on your web service: `empowerher-backend-gs03`

2. **Navigate to Environment**
   - Click "Environment" in the left sidebar

3. **Add/Update IntaSend Environment Variables**

   Add these variables (you should already have some):

   | Variable Name | Value | Notes |
   |--------------|-------|-------|
   | `INTASEND_PUBLIC_KEY` | `[your-public-key]` | From IntaSend dashboard |
   | `INTASEND_SECRET_KEY` | `[your-secret-key]` | From IntaSend dashboard |
   | `INTASEND_WEBHOOK_SECRET` | `[your-webhook-secret]` | **See Step 2 below** |
   | `INTASEND_API_URL` | `https://api.intasend.com` | Usually this is the default |
   | `INTASEND_TEST_MODE` | `false` | Set to `true` for testing |
   | `BACKEND_URL` | `https://empowerher-backend-gs03.onrender.com` | Your backend URL (no trailing slash) |

4. **Save Changes**
   - Click "Save Changes" button
   - Render will automatically redeploy your service

---

## Step 2: Get Webhook Secret from IntaSend Dashboard

The webhook secret is used to verify that webhook calls are actually from IntaSend.

### Steps:

1. **Log in to IntaSend Dashboard**
   - Visit: https://intasend.com
   - Log in to your account

2. **Navigate to Settings → Webhooks**
   - Click on "Settings" in the dashboard
   - Click on "Webhooks" in the settings menu

3. **Create or Edit Webhook**
   - If you already have a webhook, click "Edit"
   - If not, click "Create New Webhook" or "Add Webhook"

4. **Configure Webhook URL**
   - **Webhook URL**: 
     ```
     https://empowerher-backend-gs03.onrender.com/api/subscriptions/webhook
     ```
   - **Important**: Make sure the URL is exactly:
     - Starts with `https://` (not `http://`)
     - Includes `/api/subscriptions/webhook` at the end
     - No trailing slash

5. **Select Webhook Events**
   - ✅ **Payment completed** (Required)
   - ✅ **Payment failed** (Recommended)
   - ✅ **Payment pending** (Optional)

6. **Get Webhook Secret**
   - IntaSend will display or generate a **Webhook Secret**
   - Copy this secret (it looks like: `whsec_xxxxxxxxxxxxxxxx`)
   - **Important**: Save this secret - you'll need it for Step 1

7. **Save Webhook Configuration**
   - Click "Save" or "Update" button
   - The webhook is now configured in IntaSend

---

## Step 3: Update Render with Webhook Secret

Now that you have the webhook secret from IntaSend:

1. **Go back to Render Dashboard**
   - Navigate to your service: `empowerher-backend-gs03`
   - Go to "Environment" tab

2. **Add Webhook Secret**
   - Find or add `INTASEND_WEBHOOK_SECRET`
   - Paste the webhook secret you copied from IntaSend
   - Click "Save Changes"

3. **Wait for Redeployment**
   - Render will automatically redeploy
   - Check the "Logs" tab to see deployment progress
   - Wait for "Build successful" message

---

## Step 4: Verify Configuration

### Test Backend Health

1. **Visit your backend health endpoint**:
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

### Test Webhook Endpoint (Manual)

You can test if your webhook endpoint is accessible:

1. **Using curl or Postman**, send a test request:
   ```bash
   curl -X POST https://empowerher-backend-gs03.onrender.com/api/subscriptions/webhook \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

   You should get a response (even if it's an error about missing signature - that's OK, it means the endpoint is accessible).

---

## Step 5: Test Payment Flow

### Test Mode Setup (Recommended First)

1. **Set Test Mode in Render**:
   - Go to Environment variables
   - Set `INTASEND_TEST_MODE` to `true`
   - Save and redeploy

2. **Use Test API Keys** (if available):
   - IntaSend provides test API keys for testing
   - Update `INTASEND_PUBLIC_KEY` and `INTASEND_SECRET_KEY` with test keys
   - Keep test webhook URL the same

### Test Payment

1. **Visit your frontend**:
   ```
   https://empowerher-frontend.vercel.app/subscription
   ```

2. **Try to subscribe to Premium plan**:
   - Select "Premium Plan"
   - Choose payment method (M-Pesa or Card)
   - Enter details and initiate payment

3. **Check Backend Logs in Render**:
   - Go to Render Dashboard → Your Service → Logs
   - Look for:
     - "IntaSend webhook received: ..."
     - "Subscription activated for user: ..."
     - Any error messages

4. **Check IntaSend Dashboard**:
   - Go to IntaSend Dashboard → Payments or Transactions
   - Check if payment was initiated
   - Check webhook delivery status

---

## Step 6: Production Setup

Once testing is successful:

1. **Switch to Production Mode**:
   - In Render Environment variables:
     - Set `INTASEND_TEST_MODE` to `false`
     - Use production API keys (live keys from IntaSend)
     - Ensure `BACKEND_URL` is correct

2. **Verify Webhook in IntaSend Dashboard**:
   - Go to Settings → Webhooks
   - Ensure webhook URL is production URL:
     ```
     https://empowerher-backend-gs03.onrender.com/api/subscriptions/webhook
     ```
   - Verify events are selected correctly
   - Save if any changes

3. **Redeploy Backend**:
   - Save environment variables in Render
   - Wait for automatic redeployment

---

## Complete Environment Variables Checklist

Make sure you have all these set in Render:

### IntaSend Variables
- ✅ `INTASEND_PUBLIC_KEY` - Your public key
- ✅ `INTASEND_SECRET_KEY` - Your secret key
- ✅ `INTASEND_WEBHOOK_SECRET` - Webhook secret from IntaSend dashboard
- ✅ `INTASEND_API_URL` - `https://api.intasend.com`
- ✅ `INTASEND_TEST_MODE` - `false` for production, `true` for testing

### Application Variables
- ✅ `BACKEND_URL` - `https://empowerher-backend-gs03.onrender.com`
- ✅ `FRONTEND_URL` - `https://empowerher-frontend.vercel.app`
- ✅ `MONGODB_URI` - Your MongoDB Atlas connection string
- ✅ `JWT_SECRET` - Your JWT secret
- ✅ `NODE_ENV` - `production`
- ✅ `SESSION_SECRET` - Your session secret

### Other Required Variables (if applicable)
- `EMAIL_HOST` - SMTP host (e.g., `smtp.gmail.com`)
- `EMAIL_PORT` - SMTP port (e.g., `587`)
- `EMAIL_USER` - Your email
- `EMAIL_PASS` - Your email app password

---

## Troubleshooting

### Issue 1: Webhook Not Receiving Calls

**Symptoms:**
- Payment completes but subscription doesn't activate
- No "IntaSend webhook received" in backend logs

**Solutions:**
1. **Check webhook URL in IntaSend dashboard**:
   - Must be exactly: `https://empowerher-backend-gs03.onrender.com/api/subscriptions/webhook`
   - Must use `https://` (not `http://`)
   - Must include `/api/subscriptions/webhook` at the end
   - No trailing slash

2. **Check Render logs**:
   - Go to Render Dashboard → Your Service → Logs
   - Look for any errors or webhook requests
   - Check if endpoint is accessible

3. **Verify webhook events in IntaSend**:
   - Ensure "Payment completed" event is selected
   - Ensure webhook is enabled/active

4. **Test webhook endpoint manually**:
   ```bash
   curl -X POST https://empowerher-backend-gs03.onrender.com/api/subscriptions/webhook \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

### Issue 2: Webhook Signature Verification Failed

**Symptoms:**
- "Invalid webhook signature" in backend logs
- Webhook received but rejected

**Solutions:**
1. **Verify webhook secret**:
   - Check `INTASEND_WEBHOOK_SECRET` in Render matches IntaSend dashboard
   - Make sure there are no extra spaces or characters
   - Copy-paste directly from IntaSend dashboard

2. **Check webhook header**:
   - IntaSend sends signature in header: `x-intasend-signature`
   - Backend should read this automatically (already implemented)

### Issue 3: Subscription Not Activating After Payment

**Symptoms:**
- Payment completes successfully
- Webhook is received
- But subscription doesn't activate

**Solutions:**
1. **Check backend logs**:
   - Look for "Subscription activated for user: ..."
   - Check for any error messages
   - Verify user ID in webhook metadata

2. **Verify metadata**:
   - Ensure webhook contains `userId` in metadata
   - Check that user exists in database
   - Verify payment ID matches stored payment ID

3. **Check database**:
   - Verify subscription record exists
   - Check user subscription status
   - Verify payment ID is stored correctly

### Issue 4: Payment Initiation Fails

**Symptoms:**
- Error when trying to initiate payment
- "Payment gateway not configured" error

**Solutions:**
1. **Check API keys**:
   - Verify `INTASEND_PUBLIC_KEY` and `INTASEND_SECRET_KEY` are set in Render
   - Ensure keys are correct (no extra spaces)
   - Check if using test keys in production (or vice versa)

2. **Check API URL**:
   - Verify `INTASEND_API_URL` is `https://api.intasend.com`
   - Check if endpoint is accessible

3. **Check backend logs**:
   - Look for "IntaSend payment initiation error: ..."
   - Check for detailed error messages

---

## Quick Reference

### Webhook URL
```
https://empowerher-backend-gs03.onrender.com/api/subscriptions/webhook
```

### Backend Health Check
```
https://empowerher-backend-gs03.onrender.com/api/health
```

### IntaSend Dashboard
- **Main Site**: https://intasend.com
- **Webhook Settings**: Settings → Webhooks
- **API Keys**: Settings → API Keys
- **Payments**: Payments or Transactions section

### Important Notes

1. **Webhook URL must be HTTPS** in production
2. **Webhook secret must match** between IntaSend and Render
3. **Test mode first** - Use test keys and test mode before going live
4. **Monitor logs** - Check Render logs for webhook calls and errors
5. **Verify events** - Ensure correct events are selected in IntaSend dashboard

---

## Support

- **IntaSend Documentation**: https://intasend.com/docs
- **IntaSend Support**: support@intasend.com
- **Render Support**: https://render.com/docs
- **Backend Logs**: Render Dashboard → Your Service → Logs

---

## Next Steps After Setup

1. ✅ Test payment flow in test mode
2. ✅ Verify webhook is receiving calls
3. ✅ Test subscription activation
4. ✅ Switch to production mode
5. ✅ Monitor first few real payments
6. ✅ Check webhook delivery status in IntaSend dashboard

---

**Your IntaSend setup should now be complete!** 🎉

Test it out and let me know if you encounter any issues!

