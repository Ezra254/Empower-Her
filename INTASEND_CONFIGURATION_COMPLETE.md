# IntaSend Configuration - Status

## ✅ Completed Configuration

### 1. Environment Variables Added

Your `backend/.env` file has been updated with:

```env
INTASEND_PUBLIC_KEY=ISPubKey_live_87c172b9-c70d-411b-a389-5cec46f2fd13
INTASEND_SECRET_KEY=ISSecretKey_live_13d399b1-244f-4544-9fc8-3d231a2663bc
INTASEND_WEBHOOK_SECRET=your-webhook-secret-key
INTASEND_API_URL=https://api.intasend.com
INTASEND_TEST_MODE=false
BACKEND_URL=http://localhost:5000
```

### 2. Next Steps Required

#### Step 1: Get Webhook Secret from IntaSend Dashboard

1. Log in to [IntaSend Dashboard](https://intasend.com)
2. Go to **Settings** > **Webhooks**
3. Create a new webhook or edit existing one
4. Copy the **Webhook Secret**
5. Update `INTASEND_WEBHOOK_SECRET` in your `backend/.env` file

#### Step 2: Configure Webhook URL in IntaSend Dashboard

**For Local Development (Testing):**

1. Install ngrok (if not already installed):
   ```bash
   npm install -g ngrok
   # or download from https://ngrok.com
   ```

2. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

3. In another terminal, start ngrok:
   ```bash
   ngrok http 5000
   ```

4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

5. In IntaSend dashboard, set webhook URL to:
   ```
   https://abc123.ngrok.io/api/subscriptions/webhook
   ```

**For Production:**

Set webhook URL to your production backend:
```
https://your-domain.com/api/subscriptions/webhook
```

#### Step 3: Select Webhook Events

In IntaSend dashboard, make sure these events are selected:
- ✅ Payment completed
- ✅ Payment failed
- ✅ Payment pending (optional)

#### Step 4: Update BACKEND_URL for Production

When deploying, update `BACKEND_URL` in `.env`:
```env
BACKEND_URL=https://api.empowerher.com
```

## 🔍 Testing the Integration

### Test Payment Flow:

1. **Start your backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start ngrok (for local testing):**
   ```bash
   ngrok http 5000
   ```

3. **Update webhook URL in IntaSend dashboard** with ngrok URL

4. **Test a payment:**
   - Go to your frontend subscription page
   - Select Premium plan
   - Choose M-Pesa or Card payment
   - Complete the payment

5. **Check webhook:**
   - Watch backend logs for webhook calls
   - Verify subscription is activated
   - Check IntaSend dashboard for webhook delivery status

## ⚠️ Important Notes

### API Format Adjustment

The IntaSend service implementation may need adjustments based on IntaSend's actual API format. If you encounter errors:

1. **Check IntaSend API Documentation:**
   - Visit: https://developers.intasend.com/docs
   - Verify endpoint URLs and request/response formats

2. **Update Service File:**
   - File: `backend/src/services/intasend.js`
   - Adjust API endpoints if needed
   - Update request/response handling based on actual API format

3. **Common Adjustments:**
   - Authentication method (currently using Bearer token)
   - Endpoint URLs (currently using `/api/v1/payment/mpesa-stk-push/`)
   - Request body format
   - Response structure

### Using IntaSend SDK (Recommended)

For better compatibility, consider using IntaSend's official Node.js SDK:

```bash
npm install intasend-node
```

Then update the service to use the SDK instead of direct API calls.

## 📋 Checklist

- [x] Environment variables configured
- [ ] Webhook secret obtained from IntaSend dashboard
- [ ] Webhook secret added to `.env` file
- [ ] Webhook URL configured in IntaSend dashboard
- [ ] Webhook events selected in IntaSend dashboard
- [ ] Backend server running
- [ ] ngrok running (for local testing)
- [ ] Test payment completed
- [ ] Webhook received and processed
- [ ] Subscription activated successfully

## 🐛 Troubleshooting

### Payment Not Initiating:

1. Check API keys are correct in `.env`
2. Verify `INTASEND_TEST_MODE` is set correctly
3. Check backend logs for API errors
4. Verify API endpoint URLs match IntaSend documentation

### Webhook Not Receiving:

1. Verify webhook URL is publicly accessible (use ngrok for local)
2. Check webhook URL in IntaSend dashboard matches exactly
3. Verify webhook secret matches between dashboard and `.env`
4. Check backend logs for incoming webhook requests

### Subscription Not Activating:

1. Check webhook is being received (backend logs)
2. Verify webhook payload contains `userId` and `plan` in metadata
3. Check payment status is `COMPLETE` or `completed`
4. Verify user exists in database
5. Check subscription record is being created/updated

## 📚 Resources

- **IntaSend Documentation:** https://developers.intasend.com/docs
- **IntaSend API Reference:** https://developers.intasend.com/docs/api-reference
- **IntaSend Support:** support@intasend.com
- **Webhook Setup Guide:** See `INTASEND_WEBHOOK_SETUP.md`

## 🚀 Ready to Test!

Your IntaSend integration is configured and ready for testing. Follow the steps above to:

1. Get your webhook secret
2. Configure webhook URL
3. Test the payment flow
4. Verify subscription activation

If you encounter any issues, check the troubleshooting section or refer to IntaSend's documentation.




