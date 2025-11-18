# Payment System Troubleshooting Guide

## Issues Fixed

### 1. M-Pesa Payment Error: "Payment initiation failed"
### 2. Card Payment Error: "Unexpected token < in JSON at position 0"

## Changes Made

### Backend Changes (`backend/src/services/intasend.js`)

1. **Authentication Header Fixed**
   - Changed from `Bearer` to `Basic` authentication
   - IntaSend typically uses Basic Auth with base64-encoded `publicKey:secretKey`

2. **Error Handling Improved**
   - Added checks for non-JSON responses (HTML error pages)
   - Better error messages with status codes
   - Detailed logging for debugging

3. **Response Parsing Fixed**
   - Fixed issue where response body could only be read once
   - Now reads text first, then parses JSON
   - Handles both JSON and HTML responses gracefully

### Frontend Changes (`frontend/pages/subscription.tsx`)

1. **JSON Parsing Fixed**
   - Added check for Content-Type header before parsing
   - Handles HTML error responses gracefully
   - Better error messages for users

## Common Issues and Solutions

### Issue 1: "Payment initiation failed" (M-Pesa)

**Possible Causes:**
1. Incorrect API keys
2. Wrong authentication format
3. Invalid phone number format
4. API endpoint URL incorrect
5. Network/connectivity issues

**Solutions:**

1. **Verify API Keys in Environment Variables**
   ```bash
   # Check your backend environment variables
   INTASEND_PUBLIC_KEY=your-public-key
   INTASEND_SECRET_KEY=your-secret-key
   ```

2. **Check Phone Number Format**
   - M-Pesa requires phone number with country code
   - Format: `254712345678` (Kenya)
   - No spaces, dashes, or plus signs

3. **Verify Authentication Method**
   - Current implementation uses Basic Auth
   - If IntaSend uses Bearer token, update `getAuthHeaders()` in `intasend.js`
   - Check IntaSend API documentation: https://developers.intasend.com/docs

4. **Check Backend Logs**
   - Look for detailed error messages
   - Check for "IntaSend API returned non-JSON response"
   - Verify API endpoint is correct

### Issue 2: "Unexpected token < in JSON at position 0" (Card Payments)

**Cause:** Server is returning HTML (error page) instead of JSON

**Solutions:**

1. **Check Backend URL**
   - Verify `NEXT_PUBLIC_API_URL` in frontend environment
   - Ensure backend is accessible
   - Check CORS configuration

2. **Verify Backend Endpoint**
   - Test endpoint manually:
     ```bash
     curl -X POST https://your-backend.com/api/subscriptions/initiate-payment \
       -H "Content-Type: application/json" \
       -H "Authorization: Bearer YOUR_TOKEN" \
       -d '{"plan":"premium","paymentMethod":"card"}'
     ```

3. **Check Backend Logs**
   - Look for route not found errors
   - Check for server errors (500)
   - Verify middleware is working

4. **Verify Environment Variables**
   - Ensure all IntaSend variables are set
   - Check `BACKEND_URL` is correct
   - Verify API keys are not empty

## Testing Steps

### 1. Test Backend Health
```bash
curl https://your-backend.com/api/health
```

### 2. Test Payment Endpoint (with authentication)
```bash
# Get your JWT token first (from login)
curl -X POST https://your-backend.com/api/subscriptions/initiate-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "plan": "premium",
    "paymentMethod": "mpesa",
    "phoneNumber": "254712345678"
  }'
```

### 3. Check Backend Logs
- Look for:
  - "Initiating M-Pesa payment: ..."
  - "Creating payment link: ..."
  - Any error messages

### 4. Check IntaSend Dashboard
- Verify payment was initiated
- Check for any errors in IntaSend dashboard
- Verify webhook is configured

## Alternative Authentication Methods

If Basic Auth doesn't work, IntaSend might use:

### Option 1: Bearer Token
```javascript
getAuthHeaders() {
  const token = Buffer.from(`${this.publicKey}:${this.secretKey}`).toString('base64')
  return {
    'Authorization': `Bearer ${token}`,  // Try Bearer instead of Basic
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}
```

### Option 2: API Key in Header
```javascript
getAuthHeaders() {
  return {
    'X-API-Key': this.publicKey,
    'X-API-Secret': this.secretKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}
```

### Option 3: Public Key in Body, Secret in Header
```javascript
getAuthHeaders() {
  return {
    'Authorization': `Bearer ${this.secretKey}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}
// And include public_key in request body (already done)
```

## IntaSend API Documentation

Check the official IntaSend documentation for the correct authentication method:
- **Documentation**: https://developers.intasend.com/docs
- **API Reference**: https://intasend.com/api-docs
- **Support**: support@intasend.com

## Environment Variables Checklist

### Backend (Render/Your Hosting)
- ✅ `INTASEND_PUBLIC_KEY` - Your public key from IntaSend
- ✅ `INTASEND_SECRET_KEY` - Your secret key from IntaSend
- ✅ `INTASEND_WEBHOOK_SECRET` - Webhook secret (if using webhooks)
- ✅ `INTASEND_API_URL` - `https://api.intasend.com`
- ✅ `INTASEND_TEST_MODE` - `true` for testing, `false` for production
- ✅ `BACKEND_URL` - Your backend URL (e.g., `https://your-backend.onrender.com`)

### Frontend (Vercel/Your Hosting)
- ✅ `NEXT_PUBLIC_API_URL` - Your backend API URL (e.g., `https://your-backend.onrender.com/api`)

## Debugging Tips

1. **Enable Detailed Logging**
   - Check backend console logs
   - Look for "IntaSend payment initiation error"
   - Check response status codes

2. **Test with Postman/curl**
   - Test backend endpoints directly
   - Verify authentication works
   - Check response format

3. **Check Network Tab**
   - Open browser DevTools → Network
   - Check request/response headers
   - Verify Content-Type is `application/json`

4. **Verify API Keys**
   - Ensure keys are correct (no extra spaces)
   - Check if using test keys in production
   - Verify keys match IntaSend dashboard

## Next Steps

1. ✅ Deploy the updated code
2. ✅ Test M-Pesa payment
3. ✅ Test Card payment
4. ✅ Check backend logs for errors
5. ✅ Verify IntaSend dashboard for payment status
6. ✅ If still failing, check IntaSend API documentation for correct auth format

## Support

If issues persist:
1. Check IntaSend API documentation
2. Contact IntaSend support: support@intasend.com
3. Review backend logs for detailed error messages
4. Test endpoints manually with curl/Postman

