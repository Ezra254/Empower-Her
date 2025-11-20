import { useRouter } from 'next/router'
import Head from 'next/head'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const { reference, status } = router.query
  const [refValue, setRefValue] = useState<string | null>(null)

  useEffect(() => {
    if (typeof reference === 'string') {
      setRefValue(reference)
    }
  }, [reference])

  const trustBadgeMarkup = useMemo(
    () =>
      `<span style="display:block; text-align: center">
        <a href="https://intasend.com/security" target="_blank" rel="noreferrer">
          <img src="https://intasend-prod-static.s3.amazonaws.com/img/trust-badges/intasend-trust-badge-with-mpesa-hr-dark.png" width="300" alt="IntaSend Secure Payments (PCI-DSS Compliant)" style="margin: 0 auto;" />
        </a>
        <strong>
          <a style="display: block; color: #4c1d95; text-decoration: none; font-size: 0.8em; margin-top: 0.6em;"
             href="https://intasend.com/security" target="_blank" rel="noreferrer">
            Secured by IntaSend Payments
          </a>
        </strong>
      </span>`,
    []
  )

  return (
    <>
      <Head>
        <title>Payment Confirmation - EmpowerHer</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center px-4">
        <div className="bg-white shadow-2xl rounded-2xl max-w-lg w-full p-8 text-center">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-green-600 text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Successful</h1>
          <p className="text-gray-600 mb-6">
            Thanks for completing your card payment via Paystack. Your EmpowerHer premium access will unlock as soon as
            we validate the transaction.
          </p>

          {refValue ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Reference</p>
              <p className="text-lg font-mono text-gray-900 break-all">{refValue}</p>
              <p className="text-xs text-gray-500 mt-2">
                Keep this reference for your records or when contacting support.
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-yellow-800">
                We couldn’t detect a payment reference in the URL. Please ensure you open the Paystack redirect link,
                e.g. https://empowerher-frontend.vercel.app/payment-success?reference=xyz.
              </p>
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm text-gray-500">
              Status reported: <span className="font-semibold text-gray-800">{typeof status === 'string' ? status : 'pending confirmation'}</span>
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block w-full rounded-lg bg-purple-600 text-white py-3 font-semibold hover:bg-purple-700 transition"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/subscription"
              className="block w-full rounded-lg border border-purple-200 text-purple-600 py-3 font-semibold hover:bg-purple-50 transition"
            >
              Manage Subscription
            </Link>
          </div>

          <div className="mt-8" dangerouslySetInnerHTML={{ __html: trustBadgeMarkup }} />

          <p className="text-xs text-gray-400 mt-6">
            Need help? Contact support@empowerher.org with your payment reference.
          </p>
        </div>
      </div>
    </>
  )
}


