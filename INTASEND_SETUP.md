# IntaSend Payment Gateway Integration Guide

This guide explains how to configure and use IntaSend payment gateway for subscription payments in the EmpowerHer application.

## Prerequisites

1. **IntaSend Account**: Sign up for an IntaSend account at [https://intasend.com](https://intasend.com)
2. **API Keys**: Obtain your Public Key and Secret Key from the IntaSend dashboard
3. **Webhook Secret**: Set up a webhook secret for secure webhook verification

## Configuration

### 1. Environment Variables

Add the following environment variables to your `backend/.env` file:

```env
# IntaSend Payment Gateway Configuration
INTASEND_PUBLIC_KEY=your-intasend-public-key
INTASEND_SECRET_KEY=your-intasend-secret-key
INTASEND_WEBHOOK_SECRET=your-webhook-secret-key
INTASEND_API_URL=https://api.intasend.com
INTASEND_TEST_MODE=true  # Set to false for production
BACKEND_URL=http://localhost:5000  # Your backend URL (update for production)
```

### 2. Get Your API Keys

1. Log in to your IntaSend dashboard
2. Navigate to **Settings** > **API Keys**
3. Copy your **Public Key** and **Secret Key**
4. For webhooks, go to **Settings** > **Webhooks** and configure your webhook URL:
   - Webhook URL: `https://your-domain.com/api/subscriptions/webhook`
   - Events: Select payment completion events

### 3. Update Backend URL

Make sure `BACKEND_URL` in your `.env` file points to your production backend URL when deploying:

```env
BACKEND_URL=https://api.empowerher.com
```

## Payment Flow

### M-Pesa Payments

1. User selects Premium plan and chooses M-Pesa payment
2. User enters their M-Pesa registered phone number
3. System initiates M-Pesa STK Push via IntaSend
4. User receives M-Pesa prompt on their phone
5. User completes payment on their phone
6. IntaSend sends webhook to backend
7. Backend activates subscription automatically

### Card Payments

1. User selects Premium plan and chooses Card payment
2. System creates payment link via IntaSend
3. User is redirected to secure payment page
4. User completes card payment
5. IntaSend sends webhook to backend
6. Backend activates subscription automatically

## Webhook Configuration

### 1. Set Webhook URL in IntaSend Dashboard

1. Log in to IntaSend dashboard
2. Go to **Settings** > **Webhooks**
3. Add webhook URL: `https://your-domain.com/api/subscriptions/webhook`
4. Select events: Payment completed, Payment failed
5. Save webhook configuration

### 2. Verify Webhook Secret

The webhook handler verifies the signature to ensure requests are from IntaSend. Make sure `INTASEND_WEBHOOK_SECRET` matches the secret configured in your IntaSend dashboard.

## Testing

### Test Mode

1. Set `INTASEND_TEST_MODE=true` in your `.env` file
2. Use IntaSend test API keys (available in dashboard)
3. Test payments using test phone numbers or test cards

### Test Phone Numbers (M-Pesa)

IntaSend provides test phone numbers for M-Pesa testing. Check IntaSend documentation for current test numbers.

### Test Cards

Use IntaSend's test card numbers for card payment testing. Check IntaSend documentation for test card details.

## Production Setup

### 1. Switch to Production Mode

1. Set `INTASEND_TEST_MODE=false` in your `.env` file
2. Update API keys to production keys
3. Update `BACKEND_URL` to production URL
4. Configure production webhook URL in IntaSend dashboard

### 2. Security Considerations

1. **Never commit API keys to version control**
2. **Use environment variables for all sensitive data**
3. **Enable webhook signature verification**
4. **Use HTTPS for all API calls**
5. **Monitor webhook logs for suspicious activity**

## Troubleshooting

### Payment Not Processing

1. Check API keys are correct
2. Verify webhook URL is accessible
3. Check backend logs for errors
4. Verify phone number format (include country code)
5. Check IntaSend dashboard for payment status

### Webhook Not Receiving

1. Verify webhook URL is publicly accessible
2. Check webhook URL in IntaSend dashboard
3. Verify webhook secret matches
4. Check backend logs for webhook requests
5. Test webhook endpoint manually

### Subscription Not Activating

1. Check webhook is being received
2. Verify webhook payload structure
3. Check database for subscription records
4. Verify user ID in webhook metadata
5. Check backend logs for activation errors

## Support

- **IntaSend Documentation**: [https://intasend.com/docs](https://intasend.com/docs)
- **IntaSend Support**: support@intasend.com
- **API Reference**: [https://intasend.com/api-docs](https://intasend.com/api-docs)

## API Endpoints

### Initiate Payment
```
POST /api/subscriptions/initiate-payment
Body: {
  plan: 'premium',
  paymentMethod: 'mpesa' | 'card',
  phoneNumber: '254712345678' // Required for M-Pesa
}
```

### Webhook (IntaSend calls this)
```
POST /api/subscriptions/webhook
Headers: {
  x-intasend-signature: <signature>
}
Body: <IntaSend webhook payload>
```

## Currency Configuration

The default currency is KES (Kenyan Shillings). To change the currency:

1. Update plan currency in database:
```javascript
// Run in MongoDB or update Plan model
db.plans.updateOne(
  { name: 'premium' },
  { $set: { currency: 'USD' } }
)
```

2. Update IntaSend service if needed (different API endpoints for different currencies)

## Notes

- Payments are processed in real-time
- Subscriptions activate immediately upon successful payment
- Failed payments do not activate subscriptions
- Webhook retries are handled by IntaSend
- Payment links expire after a set time (check IntaSend documentation)


