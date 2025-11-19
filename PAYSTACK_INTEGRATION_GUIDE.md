# Paystack Integration Guide

This guide explains how EmpowerHer uses Paystack for subscription billing (M-Pesa and card payments) and how to configure each environment.

## 1. Create and Configure Your Paystack Account

1. Sign up at [https://dashboard.paystack.com/](https://dashboard.paystack.com/) and select **Kenya** as your business location.
2. Complete business verification so you can access live API keys.
3. In the Paystack dashboard, go to **Settings → API Keys & Webhooks** and note the following:
   - `PAYSTACK_PUBLIC_KEY`
   - `PAYSTACK_SECRET_KEY`
   - (Optional) a dedicated webhook signing secret if Paystack enables it for your account. When absent, Paystack uses the secret key for signatures.

Use the test keys (`pk_test_*`, `sk_test_*`) for local/dev environments and the live keys (`pk_live_*`, `sk_live_*`) for production.

## 2. Backend Environment Variables

Set the following variables in `backend/.env` (or deployment provider secrets):

```
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxx
PAYSTACK_API_URL=https://api.paystack.co
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

`PAYSTACK_API_URL` is optional and defaults to Paystack’s production API. Override it only if Paystack provides a regional sandbox endpoint.

## 3. Frontend Configuration

The frontend does not need Paystack keys. It simply calls the backend to initiate payments and receives the Paystack checkout link (for card payments) or instructions (for M-Pesa STK push). Ensure `NEXT_PUBLIC_API_URL` points to the backend instance with valid Paystack credentials.

## 4. Initiating Payments

1. Users open `/subscription` and choose the Premium plan.
2. The frontend calls `POST /api/subscriptions/initiate-payment` with:
   - `plan`: `premium`
   - `paymentMethod`: `card` or `mpesa`
   - `phoneNumber`: required when `paymentMethod` is `mpesa`
3. The backend creates a Paystack transaction via `/transaction/initialize`.
4. Response payload:
   - `payment.paymentLink`: Paystack authorization URL (card payments) – open this in a new tab.
   - `instructions`: human-readable instructions (e.g., “check your phone” for M-Pesa).

## 5. Webhook Setup

1. In the Paystack dashboard, add a webhook URL: `https://<your-backend-domain>/api/subscriptions/webhook`.
2. Ensure the webhook is enabled for “Charge Success/Failure” events.
3. EmpowerHer verifies every webhook using the `x-paystack-signature` header and your secret key.

### Testing Webhooks

- Use `PAYSTACK_PUBLIC_KEY`/`PAYSTACK_SECRET_KEY` test keys locally.
- Trigger a manual event via Paystack’s dashboard or complete a test transaction.
- Inspect backend logs to confirm `Subscription activated` messages.

## 6. Going Live

1. Swap test keys with live keys in your hosting provider’s secrets/variables.
2. Update `FRONTEND_URL` and `BACKEND_URL` so Paystack redirects to production domains.
3. Reconfigure the webhook URL to point to the production backend.
4. Run a real M-Pesa and card transaction with small amounts to validate end-to-end.

## 7. Troubleshooting

| Issue | Possible Cause | Fix |
|-------|----------------|-----|
| `Payment gateway not configured` error | Missing Paystack keys in backend env | Set `PAYSTACK_PUBLIC_KEY` and `PAYSTACK_SECRET_KEY`, restart server |
| Webhook signature invalid | Wrong secret key or modified payload | Confirm webhook is hitting the same backend that owns the keys; ensure HTTPS |
| M-Pesa prompt not received | Wrong phone format or unsupported SIM | Use international format (`2547xxxxxxxx`), confirm SIM is M-Pesa-enabled |
| Card payments stuck on pending | User closed Paystack page early | Instruct users to wait for success, or retry from `/subscription` |

For further help, consult the [Paystack Developer Docs](https://paystack.com/docs/).


