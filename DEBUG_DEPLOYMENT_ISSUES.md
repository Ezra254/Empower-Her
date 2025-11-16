# Debug Deployment Issues - Subscription & Report Limits

## Issues Reported

1. **Subscription Page**: Buttons are in "view mode" only on deployed app (not clickable)
2. **Report Limit**: 3-report limit is not enforced for non-subscribers on deployed app

---

## Potential Causes

### Issue 1: Subscription Buttons Not Clickable

**Possible Causes:**
1. **Plans not loading** - If `plans` array is empty, buttons might not render properly
2. **Subscription data not loading** - If subscription fails to load, `currentPlan` might be wrong
3. **JavaScript errors** - Console errors preventing event handlers from working
4. **API endpoint issues** - Production API might be different from local
5. **Environment variables** - `NEXT_PUBLIC_API_URL` might not be set correctly in Vercel

**Fixes Applied:**
- ✅ Added better error handling for plan loading
- ✅ Added default subscription state if loading fails
- ✅ Added console.log debugging
- ✅ Added `preventDefault()` and `stopPropagation()` to button clicks
- ✅ Added `aria-label` attributes
- ✅ Added loading states for buttons
- ✅ Added checks to ensure plans exist before rendering buttons

### Issue 2: Report Limit Not Enforced

**Possible Causes:**
1. **Middleware not running** - `checkReportLimit` middleware might not be executed
2. **User usage not initialized** - Users might not have `usage.reportsThisMonth` initialized
3. **Subscription data not loaded** - Frontend checks might fail if subscription data doesn't load
4. **Backend not checking** - Middleware might have errors preventing execution

**Fixes Applied:**
- ✅ Added usage initialization in middleware (if not present)
- ✅ Added console.log debugging in middleware
- ✅ Added number type coercion for reportsThisMonth
- ✅ Added better error handling in frontend limit checks
- ✅ Backend always enforces limit (even if frontend checks fail)

---

## Debugging Steps

### Step 1: Check Browser Console (Frontend)

1. **Open deployed app**: https://empowerher-frontend.vercel.app/subscription
2. **Open Developer Tools**: F12 or Right-click → Inspect
3. **Go to Console tab**
4. **Look for:**
   - `Plans loaded:` - Should show array of plans
   - `Subscription loaded:` - Should show subscription data
   - `Subscription Page State:` - Should show current state
   - Any red errors - JavaScript errors

**What to Check:**
- ✅ Are plans loading? (Should see 2 plans: free and premium)
- ✅ Is subscription loading? (Should see subscription object)
- ✅ Are there any errors? (Red messages in console)

### Step 2: Check Network Tab (Frontend)

1. **Open Network tab** in Developer Tools
2. **Filter by Fetch/XHR**
3. **Try clicking subscription button**
4. **Look for:**
   - `/subscriptions/plans` - Should return 200 with plans
   - `/subscriptions/my-subscription` - Should return 200 with subscription
   - `/subscriptions/subscribe` or `/subscriptions/initiate-payment` - Should be called when clicking button

**What to Check:**
- ✅ Are API calls being made?
- ✅ What status codes are returned? (200 = success, 401 = auth error, 404 = not found)
- ✅ Are API URLs correct? (Should be your backend URL)

### Step 3: Check Backend Logs (Render)

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click your service**: `empowerher-backend-gs03`
3. **Go to Logs tab**
4. **Try submitting a report** (if limit should be reached)
5. **Look for:**
   - `Report limit check for user:` - Should show user data
   - `Checking report limit:` - Should show reportsUsed, maxReports
   - `Report limit reached` - Should appear when limit reached
   - `Report limit check passed` - Should appear when allowed

**What to Check:**
- ✅ Is middleware being called?
- ✅ What is `reportsThisMonth` value?
- ✅ What is `maxReportsPerMonth` value?
- ✅ Are there any errors?

---

## Quick Fixes to Try

### Fix 1: Verify Environment Variables

**In Vercel:**
1. Go to your project → Settings → Environment Variables
2. Verify:
   - `NEXT_PUBLIC_API_URL` = `https://empowerher-backend-gs03.onrender.com/api`
   - Should include `/api` at the end
3. Redeploy frontend

**In Render:**
1. Go to your service → Environment tab
2. Verify:
   - `FRONTEND_URL` = `https://empowerher-frontend.vercel.app`
   - `BACKEND_URL` = `https://empowerher-backend-gs03.onrender.com`
   - All IntaSend variables are set
3. Restart service if needed

### Fix 2: Clear Browser Cache

1. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Or clear cache**:
   - Open DevTools (F12)
   - Right-click refresh button
   - Select "Empty Cache and Hard Reload"

### Fix 3: Check API Connectivity

**Test Backend Health:**
```
https://empowerher-backend-gs03.onrender.com/api/health
```

**Test Plans Endpoint:**
```
https://empowerher-backend-gs03.onrender.com/api/subscriptions/plans
```
(Note: This requires authentication, so test from browser with login)

### Fix 4: Verify Plans are Initialized

**Check if plans exist in database:**
1. Go to Render Dashboard
2. Open your service → Shell (or use MongoDB Atlas dashboard)
3. Run: `npm run init-plans`
4. Check logs to see if plans were created

---

## Common Issues & Solutions

### Issue: Buttons Don't Show Plans

**Symptom**: Subscription page shows "Loading..." for plans

**Solution**:
1. Check if `/api/subscriptions/plans` endpoint works
2. Verify authentication token is valid
3. Check Render logs for errors
4. Run `npm run init-plans` in backend

### Issue: Buttons Are Clickable But Nothing Happens

**Symptom**: Buttons look clickable but no payment modal opens

**Solution**:
1. Check browser console for JavaScript errors
2. Verify `handleSubscribe` function is being called (check console.log)
3. Check if `premiumPlan` exists (console should show it)
4. Verify API endpoints are correct

### Issue: Report Limit Not Enforced

**Symptom**: Free users can submit more than 3 reports

**Solution**:
1. Check Render logs when submitting report
2. Verify `checkReportLimit` middleware is running
3. Check user's `usage.reportsThisMonth` value in database
4. Verify free plan has `maxReportsPerMonth: 3` in database
5. Check if user is being treated as premium (wrong subscription status)

---

## Testing Checklist

### Test Subscription Buttons

- [ ] Visit subscription page on deployed app
- [ ] Open browser console (F12)
- [ ] Check for "Plans loaded:" log message
- [ ] Check for "Subscription loaded:" log message
- [ ] Click Premium button
- [ ] Check console for "handleSubscribe called with: premium"
- [ ] Check console for "Opening payment modal for premium plan"
- [ ] Verify payment modal opens
- [ ] Try clicking Free button (if not on free plan)
- [ ] Check console for subscription API calls

### Test Report Limit

- [ ] Login as free user on deployed app
- [ ] Check subscription status shows "Reports used: X / 3"
- [ ] Submit first report - should work
- [ ] Check "Reports used: 1 / 3" updates
- [ ] Submit second report - should work
- [ ] Check "Reports used: 2 / 3" updates
- [ ] Submit third report - should work
- [ ] Check "Reports used: 3 / 3" updates
- [ ] Try to submit fourth report
- [ ] Should be blocked with error message
- [ ] Check backend logs show "Report limit reached"
- [ ] Verify redirect to subscription page

---

## Next Steps

1. **Commit and push all changes**
2. **Wait for deployments** (Vercel and Render)
3. **Test on deployed app** using the checklist above
4. **Check browser console** for debug logs
5. **Check Render logs** for backend debug logs
6. **Report findings** - Share console/log output if issues persist

---

## Files Modified

- ✅ `frontend/pages/subscription.tsx` - Better error handling, debug logs, click handlers
- ✅ `frontend/pages/dashboard.tsx` - Better error handling, default subscription state
- ✅ `frontend/components/ReportModal.tsx` - Better limit checking, debug logs
- ✅ `backend/src/middleware/subscription.js` - Usage initialization, better logging

---

**All changes have console.log statements to help debug issues on the deployed app.**

