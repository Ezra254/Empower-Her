# IntaSend Webhook Setup Guide

## Step 1: Get Your Webhook Secret

1. Log in to your IntaSend dashboard at [https://intasend.com](https://intasend.com)
2. Navigate to **Settings** > **Webhooks**
3. Create a new webhook or edit an existing one
4. Copy the **Webhook Secret** (you'll need this for the `.env` file)

## Step 2: Configure Webhook URL in IntaSend Dashboard

### For Local Development (Testing):

1. Use a tool like **ngrok** to create a public URL for your local server:
   ```bash
   ngrok http 5000
   ```
   This will give you a URL like: `https://abc123.ngrok.io`

2. In IntaSend dashboard, set your webhook URL to:
   ```
   https://abc123.ngrok.io/api/subscriptions/webhook
   ```

### For Production:

1. Set your webhook URL to your production backend URL:
   ```
   https://your-domain.com/api/subscriptions/webhook
   ```
   Example: `https://api.empowerher.com/api/subscriptions/webhook`

## Step 3: Update Your .env File

After getting your webhook secret from IntaSend dashboard, update your `backend/.env` file:

```env
INTASEND_WEBHOOK_SECRET=your-actual-webhook-secret-from-intasend-dashboard
```

## Step 4: Configure Webhook Events

In your IntaSend dashboard, make sure to select these events:
- ✅ Payment completed
- ✅ Payment failed
- ✅ Payment pending (optional)

## Step 5: Update BACKEND_URL for Production

When deploying to production, update the `BACKEND_URL` in your `.env` file:

```env
BACKEND_URL=https://api.empowerher.com
```

## Testing the Webhook

### Test Locally with ngrok:

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start ngrok in another terminal:
   ```bash
   ngrok http 5000
   ```

3. Copy the ngrok URL and update it in IntaSend dashboard

4. Make a test payment and check your backend logs for webhook calls

### Verify Webhook is Working:

1. Check your backend logs when a payment is made
2. Look for: `IntaSend webhook received:`
3. Verify subscription is activated after successful payment
4. Check IntaSend dashboard for webhook delivery status

## Troubleshooting

### Webhook Not Receiving Calls:

1. **Check webhook URL is publicly accessible**
   - Local development requires ngrok or similar tool
   - Production URL must be HTTPS

2. **Verify webhook URL in IntaSend dashboard**
   - Must match exactly: `/api/subscriptions/webhook`
   - Must be HTTPS in production

3. **Check backend logs**
   - Look for webhook requests in console
   - Check for errors in webhook processing

4. **Verify webhook secret**
   - Must match between IntaSend dashboard and `.env` file
   - Webhook signature verification will fail if mismatch

### Webhook Receiving but Subscription Not Activating:

1. **Check webhook payload structure**
   - Verify metadata contains `userId` and `plan`
   - Check payment status is `COMPLETE` or `completed`

2. **Check backend logs**
   - Look for error messages in webhook processing
   - Verify user ID exists in database

3. **Verify payment ID matching**
   - Payment ID from webhook must match stored payment ID
   - Check subscription record in database

## Security Notes

1. **Never commit `.env` file to version control**
2. **Use strong webhook secrets**
3. **Enable HTTPS in production**
4. **Monitor webhook logs for suspicious activity**
5. **Verify webhook signatures** (already implemented)

## Next Steps

1. ✅ Get webhook secret from IntaSend dashboard
2. ✅ Update `INTASEND_WEBHOOK_SECRET` in `.env` file
3. ✅ Configure webhook URL in IntaSend dashboard
4. ✅ Test webhook with a test payment
5. ✅ Verify subscription activation works
6. ✅ Deploy to production with production webhook URL




