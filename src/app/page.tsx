'use client'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Aurora from '@/components/ui/Aurora'
import { QrCode, Utensils, Smartphone, Palette, ChevronRight, CheckCircle, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Utensils className="w-6 h-6 text-indigo-600" />,
      title: 'Easy Menu Builder',
      desc: 'Create categories, add items with photos, prices, and veg/non-veg badges in minutes.',
      glow: 'group-hover:shadow-[0_0_30px_rgba(79,70,229,0.15)]',
    },
    {
      icon: <QrCode className="w-6 h-6 text-violet-600" />,
      title: 'Instant QR Code',
      desc: 'Automatically generate a scannable QR code for your menu. Download and print it anywhere.',
      glow: 'group-hover:shadow-[0_0_30px_rgba(124,58,237,0.15)]',
    },
    {
      icon: <Smartphone className="w-6 h-6 text-emerald-600" />,
      title: 'Mobile-First Menus',
      desc: 'Customers get a stunning, fast-loading menu on their phone — no app download needed.',
      glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
    },
    {
      icon: <Palette className="w-6 h-6 text-blue-600" />,
      title: 'Custom Branding',
      desc: 'Upload your logo, cover photo, and choose your brand color to match your restaurant identity.',
      glow: 'group-hover:shadow-[0_0_30px_rgba(37,99,235,0.15)]',
    },
  ]

  const steps = [
    { num: '01', title: 'Sign Up Free', desc: 'Create your account in under a minute.' },
    { num: '02', title: 'Set Up Profile', desc: 'Add restaurant details, logo, and brand colors.' },
    { num: '03', title: 'Build Your Menu', desc: 'Add categories and items with photos and prices.' },
    { num: '04', title: 'Share QR Code', desc: 'Download the QR code and display it on tables!' },
  ]

  return (
    <Aurora>
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-bold mb-6">
            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
            3-Day Free Trial — No Credit Card Needed
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-800 tracking-tight mb-6 leading-tight">
            Digital Menus for Your
            <br />
            <span className="gradient-text">Restaurant</span> ✨
          </h1>

          <p className="text-base sm:text-lg text-slate-500 max-w-xl mx-auto mb-8 font-medium leading-relaxed">
            Create a beautiful online menu, generate a QR code, and let customers browse 
            from their phones. No app needed. No printing costs.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] transition-all cursor-pointer"
            >
              <span>Start Free Trial — 3 Days</span>
              <ChevronRight size={18} />
            </Link>
            <Link
              href="/menu/demo-restaurant"
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 hover:scale-[1.01] transition-all"
            >
              <Smartphone size={18} />
              See Demo Menu
            </Link>
          </div>

          {/* Hero Visual */}
          <div className="mt-16 relative float-animation">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 blur-[40px] rounded-full max-w-xs mx-auto -z-10" />
            
            <div className="bg-white rounded-3xl shadow-[0_24px_48px_rgba(15,23,42,0.06)] max-w-xs mx-auto overflow-hidden border border-slate-200/80">
              {/* Fake Phone Header */}
              <div className="bg-slate-900 p-5 text-white text-left">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center">
                    <Utensils size={22} className="text-white" />
                  </div>
                  <div>
                    <div className="font-extrabold text-base leading-tight">Spice Garden</div>
                    <div className="text-slate-400 text-xs mt-0.5">🌶️ Authentic Indian Cuisine</div>
                  </div>
                </div>
              </div>
              
              {/* Fake Menu Preview */}
              <div className="p-5 space-y-3">
                <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest text-left">🥗 Starters</div>
                {[
                  { name: 'Paneer Tikka', price: '₹249', veg: true },
                  { name: 'Chicken Wings', price: '₹349', veg: false },
                  { name: 'Veg Spring Rolls', price: '₹199', veg: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className={item.veg ? 'veg-indicator' : 'non-veg-indicator'} />
                      <span className="font-bold text-xs text-slate-800">{item.name}</span>
                    </div>
                    <span className="font-extrabold text-indigo-600 text-xs">{item.price}</span>
                  </div>
                ))}
                
                <div className="text-center pt-3">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 inline-block shadow-sm">
                    <QrCode className="w-12 h-12 text-slate-700 mx-auto" />
                    <div className="text-[10px] text-slate-500 font-bold mt-1.5">Scan to view full menu</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section id="features" className="py-16 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-indigo-600 font-extrabold text-xs uppercase tracking-widest mb-2">Features</div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4 leading-tight">
              Everything you need to go <span className="gradient-text">digital</span>
            </h2>
            <p className="text-slate-500 text-sm sm:text-base font-medium max-w-md mx-auto">
              A complete platform to create, manage, and share your restaurant menu.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div key={i} className="group bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300/80 hover:-translate-y-1 transition-all duration-300">
                <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center mb-4 transition-all">
                  {f.icon}
                </div>
                <h3 className="font-extrabold text-base text-slate-800 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-indigo-600 font-extrabold text-xs uppercase tracking-widest mb-2">Process</div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 leading-tight">
              Up and running in <span className="gradient-text">4 steps</span>
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center hover:scale-[1.01] transition-all duration-300">
                <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center text-white font-black text-lg mx-auto mb-4 group-hover:rotate-3 transition-transform shadow-sm">
                  {s.num}
                </div>
                <h3 className="font-extrabold text-base text-slate-800 mb-2">{s.title}</h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-indigo-600 font-extrabold text-xs uppercase tracking-widest mb-2">Pricing</div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 leading-tight">
              Simple, <span className="gradient-text">honest pricing</span>
            </h2>
            <p className="text-slate-500 text-sm sm:text-base font-medium mt-3 max-w-md mx-auto">
              Start free for 3 days. Then just ₹100 every 3 months — less than a cup of chai a month.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_8px_40px_rgba(15,23,42,0.06)] overflow-hidden max-w-md mx-auto">
            <div className="bg-slate-900 px-8 pt-8 pb-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.3),transparent_60%)]" />
              <div className="relative z-10">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">MenuQR Plan</div>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black text-white">₹100</span>
                  <span className="text-slate-400 text-sm font-semibold mb-2">/ 3 months</span>
                </div>
              </div>
            </div>
            <div className="p-8">
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited menu items & categories',
                  'Branded QR code & mobile menu page',
                  'Real-time order management',
                  'AI menu extraction from photos',
                  'Custom branding & themes',
                  '3-day free trial to start',
                ].map(f => (
                  <li key={f} className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                    <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full bg-slate-900 hover:bg-slate-800 text-white text-center py-3.5 rounded-xl font-bold text-sm transition-all"
              >
                Start 3-Day Free Trial
              </Link>
              <p className="text-slate-400 text-xs text-center mt-3 font-medium">No credit card required to start</p>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-16 px-4 relative z-10">
        <div className="max-w-3xl mx-auto bg-slate-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-sm">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)] pointer-events-none" />
          
          <h2 className="text-3xl sm:text-4xl font-black mb-4 relative z-10 leading-tight">
            Ready to go digital?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base font-medium mb-8 max-w-sm mx-auto relative z-10">
            Join thousands of restaurants already using MenuQR. Free forever.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center relative z-10">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-50 px-8 py-4 rounded-xl font-bold text-sm transition-all shadow-sm inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Start Free Trial</span>
              <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-slate-500 text-xs font-semibold relative z-10">
            {['3-day free trial', 'Then ₹100/3 months', 'Cancel anytime'].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-indigo-500" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 px-4 mt-12 relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
              <QrCode className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-800 font-extrabold text-base">MenuQR</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">© {new Date().getFullYear()} MenuQR. All rights reserved.</p>
          <div className="flex gap-6 text-xs font-bold">
            <Link href="/login" className="text-slate-600 hover:text-indigo-600 transition-colors">Login</Link>
            <Link href="/register" className="text-slate-600 hover:text-indigo-600 transition-colors">Register</Link>
            <Link href="/terms" className="text-slate-600 hover:text-indigo-600 transition-colors">Terms</Link>
            <Link href="/privacy" className="text-slate-600 hover:text-indigo-600 transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </Aurora>
  )
}
