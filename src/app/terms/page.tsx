import Link from 'next/link'
import { QrCode, ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-800 font-extrabold text-base">MenuQR</span>
          </Link>
          <Link href="/" className="text-slate-500 hover:text-slate-800 text-sm font-semibold flex items-center gap-1">
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-slate-800 mb-6">Terms of Service</h1>
        <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-600 prose-li:text-slate-600">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using MenuQR ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>

          <h2>2. Subscription and Payments</h2>
          <p>MenuQR operates on a subscription basis. We offer a 3-day free trial. After the trial, you must subscribe (₹100 for 3 months) to continue using the Service. Payments are processed securely via Razorpay. Subscriptions are non-refundable after the 3-day trial period ends.</p>

          <h2>3. User Responsibilities</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials. You agree not to use the Service for any illegal or unauthorized purpose. Menu contents are the sole responsibility of the restaurant owner.</p>

          <h2>4. Service Availability</h2>
          <p>We strive for 99.9% uptime but do not guarantee that the Service will be uninterrupted or error-free. We reserve the right to modify or discontinue the Service at any time.</p>

          <h2>5. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at support@menuqr.com.</p>
        </div>
      </main>
    </div>
  )
}
