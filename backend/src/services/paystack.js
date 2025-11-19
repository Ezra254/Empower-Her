const axios = require('axios')
const crypto = require('crypto')

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY
const PAYSTACK_API_URL = process.env.PAYSTACK_API_URL || 'https://api.paystack.co'

const paystackClient = axios.create({
  baseURL: PAYSTACK_API_URL,
  timeout: 15000,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  }
})

const toSubUnit = (amount = 0) => {
  const numericAmount = Number(amount) || 0
  return Math.round(numericAmount * 100)
}

async function initiatePayment({
  amount,
  currency = 'KES',
  email,
  firstName,
  lastName,
  paymentMethod = 'card',
  phoneNumber,
  callbackUrl,
  metadata = {}
}) {
  if (!PAYSTACK_PUBLIC_KEY || !PAYSTACK_SECRET_KEY) {
    return {
      success: false,
      error: 'Paystack credentials are not configured. Please contact support.'
    }
  }

  try {
    const payload = {
      amount: toSubUnit(amount),
      email,
      currency,
      callback_url: callbackUrl,
      metadata,
      channels: paymentMethod === 'mpesa' ? ['mobile_money'] : ['card']
    }

    if (paymentMethod === 'mpesa') {
      payload.mobile_money = {
        phone: phoneNumber,
        provider: 'mpesa'
      }
    }

    const response = await paystackClient.post('/transaction/initialize', payload)
    const data = response.data?.data

    if (!data) {
      return {
        success: false,
        error: 'Missing response data from Paystack'
      }
    }

    return {
      success: true,
      paymentId: data.reference,
      apiRef: data.access_code,
      status: data.status || 'pending',
      paymentLink: data.authorization_url || null
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message
    return {
      success: false,
      error: message,
      details: error.response?.data || null
    }
  }
}

function verifySignature(rawBody, signature) {
  if (!signature || !PAYSTACK_SECRET_KEY) {
    return false
  }

  const expectedSignature = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest('hex')

  return expectedSignature === signature
}

function parseWebhookEvent(rawBody) {
  try {
    const event = typeof rawBody === 'string'
      ? JSON.parse(rawBody)
      : JSON.parse(rawBody.toString('utf8'))

    const data = event.data || {}
    const metadata = data.metadata || {}

    return {
      valid: true,
      event,
      data,
      metadata,
      paymentId: data.reference,
      status: data.status,
      isSuccess: event.event === 'charge.success' && data.status === 'success',
      currency: data.currency,
      amount: typeof data.amount === 'number' ? data.amount / 100 : undefined,
      customerEmail: data.customer?.email
    }
  } catch (error) {
    return {
      valid: false,
      error: error.message
    }
  }
}

module.exports = {
  publicKey: PAYSTACK_PUBLIC_KEY,
  secretKey: PAYSTACK_SECRET_KEY,
  initiatePayment,
  verifySignature,
  parseWebhookEvent
}


