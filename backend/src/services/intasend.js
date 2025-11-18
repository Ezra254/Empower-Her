/**
 * IntaSend Payment Gateway Service
 * Handles payment processing, webhooks, and subscription payments
 */

const crypto = require('crypto')

class IntaSendService {
  constructor() {
    this.publicKey = process.env.INTASEND_PUBLIC_KEY
    this.secretKey = process.env.INTASEND_SECRET_KEY
    this.apiUrl = process.env.INTASEND_API_URL || 'https://api.intasend.com'
    this.webhookSecret = process.env.INTASEND_WEBHOOK_SECRET
    this.isTestMode = process.env.INTASEND_TEST_MODE === 'true' || process.env.NODE_ENV === 'development'
  }

  /**
   * Generate authentication headers for IntaSend API
   * 
   * Note: If Basic auth doesn't work, try:
   * - Bearer token: `Authorization: Bearer ${token}`
   * - API keys in headers: `X-API-Key` and `X-API-Secret`
   * - Check IntaSend documentation: https://developers.intasend.com/docs
   */
  getAuthHeaders() {
    const token = Buffer.from(`${this.publicKey}:${this.secretKey}`).toString('base64')
    return {
      'Authorization': `Basic ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  /**
   * Initiate a payment request
   * @param {Object} paymentData - Payment details
   * @returns {Promise<Object>} Payment response
   */
  async initiatePayment(paymentData) {
    try {
      const {
        amount,
        currency = 'KES', // Kenyan Shillings - change to your currency
        phoneNumber,
        email,
        firstName,
        lastName,
        narrative = 'Premium Subscription',
        callbackUrl,
        metadata = {}
      } = paymentData

      // Validate required fields
      if (!this.publicKey || !this.secretKey) {
        throw new Error('IntaSend API keys are not configured')
      }

      if (!phoneNumber) {
        throw new Error('Phone number is required for M-Pesa payments')
      }

      // IntaSend payment initiation endpoint
      const paymentUrl = `${this.apiUrl}/api/v1/payment/mpesa-stk-push/`

      const requestBody = {
        public_key: this.publicKey,
        amount: amount,
        currency: currency,
        phone_number: phoneNumber,
        email: email,
        first_name: firstName,
        last_name: lastName,
        narrative: narrative,
        api_ref: `sub_${Date.now()}_${Math.random().toString(36).substring(7)}`, // Unique reference
        callback_url: callbackUrl,
        metadata: metadata
      }

      console.log('Initiating M-Pesa payment:', {
        url: paymentUrl,
        amount,
        currency,
        phoneNumber: phoneNumber.substring(0, 3) + '***' // Log partial phone for privacy
      })

      const response = await fetch(paymentUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestBody)
      })

      // Read response text first (can only read once)
      const responseText = await response.text()
      const contentType = response.headers.get('content-type') || ''
      let data
      
      if (contentType.includes('application/json')) {
        try {
          data = JSON.parse(responseText)
        } catch (parseError) {
          console.error('Failed to parse JSON response:', responseText.substring(0, 500))
          throw new Error(`Invalid JSON response from payment gateway. Status: ${response.status}`)
        }
      } else {
        // Response is not JSON (likely HTML error page)
        console.error('IntaSend API returned non-JSON response:', {
          status: response.status,
          statusText: response.statusText,
          contentType: contentType,
          body: responseText.substring(0, 500)
        })
        throw new Error(`Payment gateway returned an error. Status: ${response.status} ${response.statusText}`)
      }

      if (!response.ok) {
        console.error('IntaSend payment initiation failed:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        })
        throw new Error(data.message || data.error || data.detail || `Payment initiation failed (${response.status})`)
      }

      return {
        success: true,
        paymentId: data.invoice?.invoice_id || data.id,
        apiRef: requestBody.api_ref,
        status: data.state || data.status,
        message: data.message || 'Payment initiated successfully',
        data: data
      }
    } catch (error) {
      console.error('IntaSend payment initiation error:', error)
      return {
        success: false,
        error: error.message || 'Failed to initiate payment',
        details: error
      }
    }
  }

  /**
   * Verify webhook signature
   * @param {Object} payload - Webhook payload
   * @param {String} signature - Webhook signature
   * @returns {Boolean} - Whether signature is valid
   */
  verifyWebhookSignature(payload, signature) {
    if (!this.webhookSecret) {
      console.warn('Webhook secret not configured, skipping signature verification')
      return true
    }

    try {
      const hmac = crypto.createHmac('sha256', this.webhookSecret)
      const calculatedSignature = hmac.update(JSON.stringify(payload)).digest('hex')
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(calculatedSignature)
      )
    } catch (error) {
      console.error('Webhook signature verification error:', error)
      return false
    }
  }

  /**
   * Verify payment status
   * @param {String} paymentId - Payment ID or invoice ID
   * @returns {Promise<Object>} Payment status
   */
  async verifyPayment(paymentId) {
    try {
      const verifyUrl = `${this.apiUrl}/api/v1/payment/status/${paymentId}/`

      const response = await fetch(verifyUrl, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Payment verification failed')
      }

      return {
        success: true,
        paymentId: data.invoice_id || data.id,
        status: data.state || data.status,
        amount: data.amount,
        currency: data.currency,
        paidAt: data.created_at,
        metadata: data.metadata,
        data: data
      }
    } catch (error) {
      console.error('IntaSend payment verification error:', error)
      return {
        success: false,
        error: error.message || 'Failed to verify payment',
        details: error
      }
    }
  }

  /**
   * Process webhook callback
   * @param {Object} webhookData - Webhook payload
   * @param {String} signature - Webhook signature
   * @returns {Object} Processed webhook data
   */
  processWebhook(webhookData, signature) {
    // Verify webhook signature
    if (!this.verifyWebhookSignature(webhookData, signature)) {
      return {
        valid: false,
        error: 'Invalid webhook signature'
      }
    }

    // Extract payment information
    const paymentId = webhookData.invoice_id || webhookData.id
    const status = webhookData.state || webhookData.status
    const amount = webhookData.amount
    const currency = webhookData.currency
    const apiRef = webhookData.api_ref
    const metadata = webhookData.metadata || {}

    // Determine if payment was successful
    const isSuccess = status === 'COMPLETE' || status === 'completed' || status === 'success'

    return {
      valid: true,
      paymentId,
      status,
      amount,
      currency,
      apiRef,
      metadata,
      isSuccess,
      webhookData
    }
  }

  /**
   * Create payment link for card payments (alternative to M-Pesa)
   * @param {Object} paymentData - Payment details
   * @returns {Promise<Object>} Payment link response
   */
  async createPaymentLink(paymentData) {
    try {
      const {
        amount,
        currency = 'KES',
        email,
        firstName,
        lastName,
        narrative = 'Premium Subscription',
        callbackUrl,
        metadata = {}
      } = paymentData

      // Validate required fields
      if (!this.publicKey || !this.secretKey) {
        throw new Error('IntaSend API keys are not configured')
      }

      const paymentUrl = `${this.apiUrl}/api/v1/payment/links/`

      const requestBody = {
        public_key: this.publicKey,
        amount: amount,
        currency: currency,
        email: email,
        first_name: firstName,
        last_name: lastName,
        narrative: narrative,
        api_ref: `sub_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        callback_url: callbackUrl,
        metadata: metadata
      }

      console.log('Creating payment link:', {
        url: paymentUrl,
        amount,
        currency,
        email: email.substring(0, 3) + '***' // Log partial email for privacy
      })

      const response = await fetch(paymentUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestBody)
      })

      // Read response text first (can only read once)
      const responseText = await response.text()
      const contentType = response.headers.get('content-type') || ''
      let data
      
      if (contentType.includes('application/json')) {
        try {
          data = JSON.parse(responseText)
        } catch (parseError) {
          console.error('Failed to parse JSON response:', responseText.substring(0, 500))
          throw new Error(`Invalid JSON response from payment gateway. Status: ${response.status}`)
        }
      } else {
        // Response is not JSON (likely HTML error page)
        console.error('IntaSend API returned non-JSON response:', {
          status: response.status,
          statusText: response.statusText,
          contentType: contentType,
          body: responseText.substring(0, 500)
        })
        throw new Error(`Payment gateway returned an error. Status: ${response.status} ${response.statusText}`)
      }

      if (!response.ok) {
        console.error('IntaSend payment link creation failed:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        })
        throw new Error(data.message || data.error || data.detail || `Payment link creation failed (${response.status})`)
      }

      return {
        success: true,
        paymentLink: data.url || data.checkout_url,
        paymentId: data.id,
        apiRef: requestBody.api_ref,
        status: data.status,
        message: data.message || 'Payment link created successfully',
        data: data
      }
    } catch (error) {
      console.error('IntaSend payment link creation error:', error)
      return {
        success: false,
        error: error.message || 'Failed to create payment link',
        details: error
      }
    }
  }
}

module.exports = new IntaSendService()




