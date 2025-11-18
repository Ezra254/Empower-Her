# Payment System Fixes - Summary

## Issues Fixed

✅ **M-Pesa Payment Error**: "Payment initiation failed"  
✅ **Card Payment Error**: "Unexpected token < in JSON at position 0"

## Changes Made

### 1. Authentication Header Fix
**File**: `backend/src/services/intasend.js`

- Changed from `Bearer` to `Basic` authentication
- IntaSend typically uses Basic Auth with base64-encoded credentials

### 2. Error Handling Improvements
**Files**: 
- `backend/src/services/intasend.js`
- `frontend/pages/subscription.tsx`

- Added checks for non-JSON responses (HTML error pages)
- Fixed response body reading (can only be read once)
- Better error messages with status codes
- Detailed logging for debugging

### 3. Response Parsing Fix
- Now reads response text first, then parses JSON
- Handles both JSON and HTML responses gracefully
- Better error messages for users

## Next Steps

1. **Deploy the updated code** to your backend
2. **Test M-Pesa payment** - should now show better error messages if it fails
3. **Test Card payment** - should no longer show "unexpected token" error
4. **Check backend logs** for detailed error information

## If Issues Persist

### Check Authentication Method

If Basic Auth doesn't work, IntaSend might use a different method. Try:

1. **Bearer Token** (change line 28 in `intasend.js`):
   ```javascript
   'Authorization': `Bearer ${token}`
   ```

2. **Check IntaSend Documentation**:
   - Visit: https://developers.intasend.com/docs
   - Verify the correct authentication format
   - Check API endpoint URLs

### Verify Environment Variables

Make sure these are set in your backend:
- `INTASEND_PUBLIC_KEY`
- `INTASEND_SECRET_KEY`
- `INTASEND_API_URL` (should be `https://api.intasend.com`)
- `BACKEND_URL` (your backend URL)

### Check Backend Logs

The improved error handling will now show:
- Detailed error messages
- Response status codes
- Response body (first 500 chars)
- Content-Type headers

This will help identify the exact issue.

## Testing

1. **Test Backend Health**:
   ```
   https://your-backend.com/api/health
   ```

2. **Test Payment Endpoint** (use Postman or curl):
   ```bash
   curl -X POST https://your-backend.com/api/subscriptions/initiate-payment \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{"plan":"premium","paymentMethod":"mpesa","phoneNumber":"254712345678"}'
   ```

3. **Check Logs**:
   - Look for "Initiating M-Pesa payment" or "Creating payment link"
   - Check for any error messages
   - Verify response status codes

## Files Modified

1. `backend/src/services/intasend.js` - Fixed authentication and error handling
2. `frontend/pages/subscription.tsx` - Fixed JSON parsing
3. `PAYMENT_TROUBLESHOOTING.md` - Comprehensive troubleshooting guide (new)

## Support

- **IntaSend Documentation**: https://developers.intasend.com/docs
- **IntaSend Support**: support@intasend.com
- **Troubleshooting Guide**: See `PAYMENT_TROUBLESHOOTING.md`

