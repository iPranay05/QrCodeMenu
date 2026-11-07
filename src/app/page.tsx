'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Aurora from '@/components/ui/Aurora'
import {
  QrCode,
  Utensils,
  Smartphone,
  Palette,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
  Camera,
  Printer,
  Zap,
  ShoppingBag,
  ChevronDown,
  ShieldCheck,
  Eye,
  Star,
  Check
} from 'lucide-react'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'starters' | 'mains' | 'drinks'>('starters')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const previewItems = {
    starters: [
      { name: 'Paneer Tikka', price: '₹249', veg: true, prep: '15 mins', desc: 'Charcoal grilled cottage cheese marinated in spiced yogurt' },
      { name: 'Crispy Corn Salt & Pepper', price: '₹199', veg: true, prep: '10 mins', desc: 'Tossed with scallions, green chilies, and roasted cumin' },
      { name: 'Tandoori Murgh Wings', price: '₹349', veg: false, prep: '20 mins', desc: 'Smoky chicken wings tossed in rich desi ghee glaze' },
    ],
    mains: [
      { name: 'Butter Chicken Special', price: '₹399', veg: false, prep: '25 mins', desc: 'Slow-cooked in velvety tomato gravy with kasoori methi' },
      { name: 'Dal Makhani Bukhara', price: '₹289', veg: true, prep: '20 mins', desc: 'Black lentils slow simmered overnight with butter and cream' },
      { name: 'Dum Biryani Pot', price: '₹379', veg: true, prep: '25 mins', desc: 'Aromatic basmati rice layered with saffron and seasonal vegetables' },
    ],
    drinks: [
      { name: 'Mango Lassi Royale', price: '₹149', veg: true, prep: '5 mins', desc: 'Thick curd churned with Alphonso mango pulp and pistachios' },
      { name: 'Fresh Mint Lime Fizz', price: '₹119', veg: true, prep: '5 mins', desc: 'Crushed garden mint with sparkling water and rock salt' },
    ]
  }

  const features = [
    {
      icon: <Camera className="size-5 text-indigo-600" />,
      tag: 'AI Powered',
      title: 'AI Menu Scanner',
      desc: 'Snap a photo of your existing paper menu. Our AI extracts dishes, descriptions, and prices in 10 seconds flat.',
    },
    {
      icon: <Clock className="size-5 text-amber-600" />,
      tag: 'New Feature',
      title: 'Food Preparation Times',
      desc: 'Show real kitchen cooking estimates on each dish. Manage guest expectations and avoid table wait inquiries.',
    },
    {
      icon: <Palette className="size-5 text-violet-600" />,
      tag: 'Customizable',
      title: 'Vintage & Modern Themes',
      desc: 'Choose between an elegant Leather Book theme with realistic binder rings or a sleek minimalist modern layout.',
    },
    {
      icon: <Zap className="size-5 text-emerald-600" />,
      tag: 'Instant Updates',
      title: 'Live Price & 86 Toggles',
      desc: 'Sold out of a dish? Update prices or mark items unavailable instantly on phones without touching a printer.',
    },
    {
      icon: <Printer className="size-5 text-blue-600" />,
      tag: 'Ready to Print',
      title: 'Vector QR Kit Generator',
      desc: 'Download crisp, high-resolution QR codes formatted for table tents, acrylic stands, and counter stickers.',
    },
    {
      icon: <ShoppingBag className="size-5 text-rose-600" />,
      tag: 'Kitchen Orders',
      title: 'Table-Specific Live Orders',
      desc: 'Let diners order directly from their phone. Orders arrive immediately on your kitchen screen with the table number.',
    },
  ]

  const steps = [
    {
      num: '01',
      title: 'Create Your Menu in Minutes',
      desc: 'Import from a photo or type in your dishes with veg/non-veg tags, prices, and prep times.',
      icon: <Sparkles className="size-5 text-indigo-500" />
    },
    {
      num: '02',
      title: 'Brand It Your Way',
      desc: 'Upload your restaurant logo, select brand colors, and pick between Vintage Book or Modern layout.',
      icon: <Palette className="size-5 text-violet-500" />
    },
    {
      num: '03',
      title: 'Display QR on Tables',
      desc: 'Download and print custom QR table cards. Guests scan with their phone camera to browse instantly.',
      icon: <QrCode className="size-5 text-emerald-500" />
    },
  ]

  const faqs = [
    {
      q: 'Do customers need to download an app to view the menu?',
      a: 'Never. Customers simply open their regular phone camera, point it at the QR code, and your menu opens instantly in their web browser (Chrome, Safari, etc.) within one second.'
    },
    {
      q: 'What happens when I change prices or run out of an item?',
      a: 'Your QR code stays exactly the same forever! When you edit prices or toggle items off from your phone or laptop dashboard, customers see the updates immediately on their screens.'
    },
    {
      q: 'Can I upload a picture of my current physical menu card?',
      a: 'Yes! Our built-in AI Menu Scanner lets you upload photos of your printed menu. It reads your dishes, descriptions, and prices automatically so you don’t have to type them by hand.'
    },
    {
      q: 'How does the 3-day free trial work?',
      a: 'You get complete, unrestricted access to the menu builder, AI scanner, QR code downloads, and ordering system. No credit card is required to sign up. After 3 days, it’s just ₹100 for 3 months.'
    },
    {
      q: 'Can customers place food orders through the QR code?',
      a: 'Yes, if you choose to enable online orders, diners can add items to their cart, enter their table number, and submit orders directly to your dashboard live feed.'
    }
  ]

  return (
    <Aurora>
      <Navbar />

      {/* ── 1. HERO SECTION ── */}
      <section className="pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-200/90 text-slate-800 px-3.5 py-1.5 rounded-full text-xs font-bold mb-6 shadow-xs">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-600 font-medium">Over 500+ restaurant menus live</span>
            <span className="text-slate-300">•</span>
            <span className="text-indigo-600 font-bold">3-Day Free Trial</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6 text-balance">
            Turn Your Physical Menu Into an{' '}
            <span className="gradient-text">Elegant Digital Experience</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 font-medium leading-relaxed text-pretty">
            Generate contact-free QR codes, display live food preparation times, and let guests
            browse mouthwatering dishes on their phone in seconds. Zero apps to download.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-md mx-auto mb-10">
            <Link
              href="/register"
              className="w-full sm:w-auto flex-1 bg-slate-900 hover:bg-slate-800 text-white px-7 py-3.5 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 hover:translate-y-[-1px] transition-all cursor-pointer"
            >
              <span>Start Free 3-Day Trial</span>
              <ChevronRight size={16} />
            </Link>
            <Link
              href="/menu/demo-restaurant"
              target="_blank"
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-6 py-3.5 rounded-xl font-bold text-sm shadow-xs flex items-center justify-center gap-2 hover:translate-y-[-1px] transition-all"
            >
              <Eye size={16} className="text-slate-500" />
              <span>Preview Demo Menu</span>
            </Link>
          </div>

          {/* Metric Strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-slate-500 font-semibold mb-14">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-500" />
              <span>3-Minute Setup</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-500" />
              <span>Zero App Downloads</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-500" />
              <span>Instant Price Updates</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-500" />
              <span>Only ₹100 for 3 Months</span>
            </div>
          </div>

          {/* ── INTERACTIVE MOCKUP SHOWCASE ── */}
          <div className="relative max-w-md mx-auto">
            {/* Ambient Backing Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/15 via-violet-500/15 to-transparent blur-3xl rounded-full -z-10" />

            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.08)] overflow-hidden text-left">
              
              {/* Fake Phone Top Bar */}
              <div className="bg-slate-900 text-white p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="size-9 rounded-xl bg-white/10 flex items-center justify-center font-black text-sm">
                      🍽️
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm leading-tight text-white">The Saffron Table</h3>
                      <p className="text-[11px] text-slate-400">Authentic Bistro & Kitchen</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                    Open Now
                  </span>
                </div>

                {/* Category Pills inside mock */}
                <div className="flex gap-1.5 pt-1">
                  {(['starters', 'mains', 'drinks'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                        activeTab === tab
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'bg-white/10 text-slate-300 hover:bg-white/20'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fake Menu Items Feed */}
              <div className="p-4 space-y-2.5 bg-slate-50/60 min-h-[260px]">
                {previewItems[activeTab].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200/70 shadow-xs flex items-start justify-between gap-3 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center justify-center size-3.5 border-2 rounded ${
                            item.veg ? 'border-green-600' : 'border-red-600'
                          }`}
                        >
                          <span className={`size-1.5 rounded-full ${item.veg ? 'bg-green-600' : 'bg-red-600'}`} />
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 truncate">{item.name}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 leading-snug">{item.desc}</p>
                      
                      {/* Prep time badge preview */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                          <Clock size={10} className="text-amber-500" />
                          {item.prep}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="font-black text-xs text-slate-900 tabular-nums">{item.price}</div>
                      <button className="mt-2 text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-2.5 py-1 rounded-md border border-indigo-100 transition-colors">
                        + Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mock Table QR Callout */}
              <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-10 bg-slate-100 rounded-xl flex items-center justify-center p-1.5 border border-slate-200">
                    <QrCode className="size-full text-slate-800" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Table #04 QR Stand</div>
                    <div className="text-[11px] text-slate-400">Scanned by your guest</div>
                  </div>
                </div>
                <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  Instant Load ⚡
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. FEATURES GRID ── */}
      <section id="features" className="py-20 px-4 sm:px-6 relative z-10 border-t border-slate-200/60 bg-white/50">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center mb-14">
            <span className="text-indigo-600 font-extrabold text-xs uppercase tracking-widest mb-2 block">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight text-balance">
              Engineered specifically for restaurants, cafes & bars
            </h2>
            <p className="text-slate-500 text-sm sm:text-base font-medium max-w-lg mx-auto mt-3 text-pretty">
              Everything required to modernize your dining experience without complicated POS hardware.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm hover:translate-y-[-2px] transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="size-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                      {feat.icon}
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {feat.tag}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 relative z-10 border-t border-slate-200/60">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center mb-14">
            <span className="text-indigo-600 font-extrabold text-xs uppercase tracking-widest mb-2 block">
              Effortless Setup
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight text-balance">
              Up and running on your tables in 3 steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-xs relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="size-9 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                      {s.num}
                    </span>
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                      {s.icon}
                    </div>
                  </div>
                  <h3 className="font-black text-base text-slate-900 mb-2 leading-snug">{s.title}</h3>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. HONEST PRICING ── */}
      <section id="pricing" className="py-20 px-4 sm:px-6 relative z-10 border-t border-slate-200/60 bg-white/40">
        <div className="max-w-3xl mx-auto">
          
          <div className="text-center mb-12">
            <span className="text-indigo-600 font-extrabold text-xs uppercase tracking-widest mb-2 block">
              Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight text-balance">
              Affordable for every independent food business
            </h2>
            <p className="text-slate-500 text-sm sm:text-base font-medium mt-3 max-w-md mx-auto text-pretty">
              Start completely free for 3 days. Then just ₹100 every 3 months — less than ₹1 per day.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_12px_40px_rgba(15,23,42,0.06)] overflow-hidden max-w-md mx-auto">
            {/* Card Header */}
            <div className="bg-slate-900 p-8 text-white relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
                  Standard Plan
                </span>
                <span className="text-[10px] font-bold bg-white/15 px-2.5 py-1 rounded-full uppercase">
                  3-Day Free Trial
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white tabular-nums">₹100</span>
                <span className="text-slate-400 text-sm font-semibold">/ 3 months</span>
              </div>
              <p className="text-slate-400 text-xs mt-2 font-medium">Billed quarterly. Cancel at any time.</p>
            </div>

            {/* Checklist */}
            <div className="p-8">
              <ul className="space-y-3.5 mb-8">
                {[
                  'Unlimited menu items & categories',
                  'Food preparation time badges',
                  'AI camera menu scanner from photos',
                  'Custom logo & brand color customization',
                  'Vintage Leather Book & Modern themes',
                  'Printable high-res vector QR code kits',
                  'Live table ordering & kitchen feed',
                  'Zero commission on orders',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 text-xs font-semibold">
                    <Check className="size-4 text-emerald-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className="block w-full bg-slate-900 hover:bg-slate-800 text-white text-center py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all"
              >
                Start 3-Day Free Trial
              </Link>
              <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs font-medium mt-3">
                <ShieldCheck size={14} className="text-slate-400" />
                <span>No credit card required to begin</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. FAQ SECTION ── */}
      <section className="py-20 px-4 sm:px-6 relative z-10 border-t border-slate-200/60">
        <div className="max-w-3xl mx-auto">
          
          <div className="text-center mb-12">
            <span className="text-indigo-600 font-extrabold text-xs uppercase tracking-widest mb-2 block">
              Common Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight text-balance">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-slate-900 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <span className="pr-4">{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? 'rotate-180 text-indigo-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 font-medium leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 6. FINAL CALL TO ACTION ── */}
      <section className="py-20 px-4 sm:px-6 relative z-10 border-t border-slate-200/60">
        <div className="max-w-4xl mx-auto bg-slate-900 rounded-3xl p-8 sm:p-14 text-center text-white relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.25),transparent_60%)] pointer-events-none" />
          
          <h2 className="text-3xl sm:text-4xl font-black mb-4 relative z-10 leading-tight text-balance">
            Give your diners a menu they'll love scanning
          </h2>
          <p className="text-slate-400 text-sm sm:text-base font-medium mb-8 max-w-lg mx-auto relative z-10 text-pretty">
            Set up your restaurant in under 3 minutes. Test it on your phone today with our 3-day full free trial.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center relative z-10">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Create Free Account</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-slate-400 text-xs font-semibold relative z-10">
            {['3-day full free trial', 'No credit card needed', 'Cancel anytime'].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-indigo-400" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. FOOTER ── */}
      <footer className="bg-white border-t border-slate-200 py-12 px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-slate-900 flex items-center justify-center shadow-xs">
              <QrCode className="size-4 text-white" />
            </div>
            <span className="text-slate-900 font-extrabold text-base">MenuQR</span>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            © {new Date().getFullYear()} MenuQR. Built with pride for restaurant owners.
          </p>

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
