import Link from 'next/link'
import { QrCode, ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-black text-slate-800 mb-6">Privacy Policy</h1>
        <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-600 prose-li:text-slate-600">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you create an account, such as your name, email address, phone number, and restaurant details. When customers view your menu, we collect basic analytics such as page views, but we do not track individual customers across sites.</p>

          <h2>2. Payment Information</h2>
          <p>We use Razorpay for payment processing. We do not store your credit card details or other sensitive payment information on our servers. This data is handled securely by Razorpay.</p>

          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our Service, to process your transactions, and to communicate with you about your account.</p>

          <h2>4. Data Security</h2>
          <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>

          <h2>5. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at privacy@menuqr.com.</p>
        </div>
      </main>
    </div>
  )
}
