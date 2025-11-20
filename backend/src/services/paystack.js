const axios = require('axios')
const crypto = require('crypto')

const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET || PAYSTACK_SECRET_KEY
const PAYSTACK_API_URL = process.env.PAYSTACK_API_URL || 'https://api.paystack.co'

const client = axios.create({
  baseURL: PAYSTACK_API_URL,
  timeout: 20000,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  }
})

const ensureConfigured = () => {
  if (!PAYSTACK_PUBLIC_KEY || !PAYSTACK_SECRET_KEY) {
    return {
      success: false,
      error: 'Paystack credentials are not configured. Please contact support.'
    }
  }
  return null
}

const toMinorUnits = amount => {
  const numericAmount = Number(amount)
  if (Number.isNaN(numericAmount)) {
    throw new Error('Invalid amount provided for Paystack transaction')
  }
  return Math.round(numericAmount * 100)
}

const normalizePhoneNumber = phone => {
  if (!phone) return null
  const trimmed = phone.toString().trim()
  if (trimmed.startsWith('+')) {
    return trimmed
  }
  const digits = trimmed.replace(/[^\d]/g, '')
  if (!digits) return null
  if (digits.startsWith('0')) {
    return `+254${digits.slice(1)}`
  }
  if (digits.startsWith('254')) {
    return `+${digits}`
  }
  return `+${digits}`
}

async function createPaymentSession({
  amount,
  currency = 'KES',
  email,
  firstName,
  lastName,
  callbackUrl,
  metadata = {}
}) {
  const configError = ensureConfigured()
  if (configError) return configError

  try {
    const payload = {
      email,
      amount: toMinorUnits(amount),
      currency,
      callback_url: callbackUrl,
      metadata: {
        ...metadata,
        customer: {
          firstName,
          lastName
        }
      }
    }

    const response = await client.post('/transaction/initialize', payload)
    const data = response.data?.data || {}

    return {
      success: true,
      paymentId: data.reference,
      apiRef: data.reference,
      status: 'pending',
      paymentLink: data.authorization_url
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      details: error.response?.data || null
    }
  }
}

async function verifyTransaction(reference) {
  const configError = ensureConfigured()
  if (configError) return configError

  try {
    const response = await client.get(`/transaction/verify/${reference}`)
    const data = response.data?.data || {}

    return {
      success: data.status === 'success',
      data
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      details: error.response?.data || null
    }
  }
}

async function initiateMpesaPayment({
  amount,
  currency = 'KES',
  email,
  phoneNumber,
  metadata = {}
}) {
  const configError = ensureConfigured()
  if (configError) return configError

  const normalizedPhone = normalizePhoneNumber(phoneNumber)
  if (!normalizedPhone) {
    return {
      success: false,
      error: 'Valid phone number is required for M-Pesa payments'
    }
  }

  try {
    const payload = {
      amount: toMinorUnits(amount),
      email,
      currency,
      mobile_money: {
        phone: normalizedPhone,
        provider: 'mpesa'
      },
      metadata: {
        ...metadata,
        paymentChannel: 'mpesa'
      }
    }

    const response = await client.post('/charge', payload)
    const data = response.data?.data || {}

    return {
      success: true,
      paymentId: data.reference,
      apiRef: data.reference,
      status: data.status || 'pending',
      requiresAction: data.status === 'pending'
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      details: error.response?.data || null
    }
  }
}

function processWebhook(payload, signature) {
  if (!PAYSTACK_WEBHOOK_SECRET) {
    return {
      valid: false,
      error: 'Webhook secret not configured'
    }
  }

  const serializedPayload = JSON.stringify(payload)
  const expectedSignature = crypto
    .createHmac('sha512', PAYSTACK_WEBHOOK_SECRET)
    .update(serializedPayload)
    .digest('hex')

  if (expectedSignature !== signature) {
    return {
      valid: false,
      error: 'Invalid webhook signature'
    }
  }

  const data = payload?.data || {}
  const metadata = data.metadata || {}
  const amount = typeof data.amount === 'number' ? data.amount / 100 : null
  const currency = data.currency || 'KES'
  const status = data.status || payload?.event || 'pending'
  const reference = data.reference || metadata.reference

  const isSuccess =
    payload?.event === 'charge.success' &&
    (data.status || '').toLowerCase() === 'success'

  return {
    valid: true,
    paymentId: reference,
    apiRef: reference,
    metadata,
    amount,
    currency,
    status,
    isSuccess,
    data
  }
}

module.exports = {
  publicKey: PAYSTACK_PUBLIC_KEY,
  secretKey: PAYSTACK_SECRET_KEY,
  createPaymentSession,
  initiateMpesaPayment,
  verifyTransaction,
  processWebhook
}


