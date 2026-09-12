import Link from 'next/link'
import { AlertTriangle, ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-3">404 - Not Found</h1>
        <p className="text-slate-500 font-medium mb-8">
          The page you're looking for doesn't exist, was moved, or you typed the wrong URL.
        </p>
        <Link 
          href="/" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl inline-flex items-center gap-2 transition-colors"
        >
          Go Back Home <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
