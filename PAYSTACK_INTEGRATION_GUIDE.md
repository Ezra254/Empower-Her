# Paystack Integration Guide

This guide explains how EmpowerHer integrates with Paystack for subscription billing. Follow the steps below to configure your Paystack account, environment variables, and webhook handling.

---

## 1. Create and Configure Your Paystack Account

1. Sign up at [https://paystack.com](https://paystack.com) and complete your business verification.
2. Navigate to **Settings → API Keys & Webhooks**.
3. Copy the following credentials:
   - **Public Key** (`pk_test_xxx` or `pk_live_xxx`)
   - **Secret Key** (`sk_test_xxx` or `sk_live_xxx`)
   - **Webhook Signing Secret** (create one under the Webhooks section)
4. Enable the currencies you plan to accept (e.g., `KES`, `USD`).

---

## 2. Backend Environment Variables

Create or update `backend/.env` with the Paystack credentials:

```env
PAYSTACK_PUBLIC_KEY=pk_test_xxx
PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret
PAYSTACK_API_URL=https://api.paystack.co
PAYSTACK_REDIRECT_URL=https://empowerher-frontend.vercel.app/payment-success
```

- `PAYSTACK_REDIRECT_URL` is the page Paystack redirects users to after card checkout. EmpowerHer uses `https://empowerher-frontend.vercel.app/payment-success`.
- Restart the backend after changing environment variables.

---

## 3. Webhook Configuration

1. In the Paystack dashboard, go to **Settings → API Keys & Webhooks**.
2. Set the **Webhook URL** to:
   ```
   https://<your-backend-domain>/api/subscriptions/webhook
   ```
3. Paste the same **Webhook Signing Secret** you configured in the `.env` file.
4. Save the settings and click **Send Test** to verify delivery.

EmpowerHer validates every webhook using the `x-paystack-signature` header (HMAC-SHA512). Webhooks that fail signature verification are rejected.

---

## 4. Payment Flow Overview

1. The frontend calls `POST /api/subscriptions/initiate-payment` with `plan` and `paymentMethod: "card"`.
2. The backend uses `services/paystack.js` to create a Paystack transaction via `/transaction/initialize`.
3. The API responds with a `paymentLink` (Paystack hosted checkout) that the frontend opens in a new tab.
4. After the customer completes payment, Paystack:
   - Redirects the customer to `PAYSTACK_REDIRECT_URL`.
   - Sends a webhook to `/api/subscriptions/webhook`.
5. The webhook verifies the signature and, on success, activates the user’s premium subscription.

---

## 5. Testing Payments

- Use [Paystack test cards](https://paystack.com/docs/payments/test-payments) while in test mode.
- Ensure you use the **test** public/secret keys when running locally.
- Monitor webhook deliveries from the Paystack dashboard under **Developers → Logs**.

---

## 6. Troubleshooting

| Issue | Possible Cause | Resolution |
|-------|----------------|------------|
| `Payment gateway not configured` | Missing Paystack keys in backend `.env` | Set `PAYSTACK_PUBLIC_KEY` and `PAYSTACK_SECRET_KEY`, then restart the backend |
| `Invalid webhook signature` | Webhook secret mismatch | Confirm `PAYSTACK_WEBHOOK_SECRET` matches the value in the Paystack dashboard |
| Payment never activates subscription | Webhook not reaching backend | Confirm the backend URL is publicly reachable and `/api/subscriptions/webhook` is whitelisted |
| Amount shows as 0.00 in Paystack | Plan price missing or zero | Verify plan configuration via `Plan.ensureDefaultPlans()` or `init-plans` script |

Refer to the [Paystack Developer Docs](https://paystack.com/docs/) for detailed API behavior and additional features such as split payments, bank transfers, or payment pages.


