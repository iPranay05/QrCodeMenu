import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { QrCode, Utensils, Smartphone, Palette, Star, ChevronRight, CheckCircle } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Utensils className="w-7 h-7 text-orange-500" />,
      title: 'Easy Menu Builder',
      desc: 'Create categories, add items with photos, prices, and veg/non-veg badges in minutes.',
      bg: 'bg-orange-50',
    },
    {
      icon: <QrCode className="w-7 h-7 text-rose-500" />,
      title: 'Instant QR Code',
      desc: 'Automatically generate a scannable QR code for your menu. Download and print it anywhere.',
      bg: 'bg-rose-50',
    },
    {
      icon: <Smartphone className="w-7 h-7 text-purple-500" />,
      title: 'Mobile-First Menus',
      desc: 'Customers get a stunning, fast-loading menu on their phone — no app download needed.',
      bg: 'bg-purple-50',
    },
    {
      icon: <Palette className="w-7 h-7 text-amber-500" />,
      title: 'Custom Branding',
      desc: 'Upload your logo, cover photo, and choose your brand color to match your restaurant identity.',
      bg: 'bg-amber-50',
    },
  ]

  const steps = [
    { num: '01', title: 'Sign Up Free', desc: 'Create your account in under a minute.' },
    { num: '02', title: 'Set Up Profile', desc: 'Add your restaurant name, logo, and brand colors.' },
    { num: '03', title: 'Build Your Menu', desc: 'Add categories and menu items with photos and prices.' },
    { num: '04', title: 'Share QR Code', desc: 'Download the QR code and display it on your tables!' },
  ]

  const testimonials = [
    { name: 'Arjun Mehta', role: 'Owner, Spice Garden', text: 'Our customers love scanning the QR and seeing our beautiful menu. Setup took 10 minutes!', stars: 5 },
    { name: 'Priya Sharma', role: 'Manager, The Curry House', text: 'We update our menu instantly — no more reprinting costs. Absolutely love it.', stars: 5 },
    { name: 'Carlos Rivera', role: 'Chef & Owner, El Sabor', text: 'Professional, fast, beautiful menus. My international guests are always impressed.', stars: 5 },
  ]

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-gradient pt-28 pb-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold mb-8 fade-in-up">
            <span className="w-2 h-2 bg-orange-500 rounded-full" style={{ animation: 'pulseDot 1.5s infinite' }} />
            100% Free to Get Started
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6 fade-in-up" style={{ animationDelay: '0.1s' }}>
            Digital Menus for Your
            <br />
            <span className="gradient-text">Restaurant</span> ✨
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 fade-in-up" style={{ animationDelay: '0.2s' }}>
            Create a beautiful online menu, generate a QR code, and let customers browse 
            from their phones. No app needed. No printing costs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link
              href="/register"
              className="btn-gradient text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-orange-200 inline-flex items-center gap-2"
            >
              <span>Create Your Menu Free</span>
              <ChevronRight size={20} />
            </Link>
            <Link
              href="/menu/demo-restaurant"
              className="bg-white text-gray-700 border-2 border-gray-200 px-8 py-4 rounded-2xl font-bold text-lg hover:border-orange-300 hover:text-orange-500 transition-all inline-flex items-center gap-2"
            >
              <Smartphone size={20} />
              See Demo Menu
            </Link>
          </div>

          {/* Hero Visual */}
          <div className="mt-16 relative float-animation">
            <div className="bg-white rounded-3xl shadow-2xl shadow-orange-100 max-w-sm mx-auto overflow-hidden border border-orange-100">
              {/* Fake Phone Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-5 text-white text-left">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Utensils size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-lg">Spice Garden</div>
                    <div className="text-orange-100 text-sm">🌶️ Authentic Indian Cuisine</div>
                  </div>
                </div>
              </div>
              {/* Fake Menu Preview */}
              <div className="p-4 space-y-3">
                <div className="text-xs font-bold text-orange-500 uppercase tracking-wider">🥗 Starters</div>
                {[
                  { name: 'Paneer Tikka', price: '₹249', veg: true },
                  { name: 'Chicken Wings', price: '₹349', veg: false },
                  { name: 'Veg Spring Rolls', price: '₹199', veg: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className={item.veg ? 'veg-indicator' : 'non-veg-indicator'} />
                      <span className="font-medium text-sm text-gray-800">{item.name}</span>
                    </div>
                    <span className="font-bold text-orange-600 text-sm">{item.price}</span>
                  </div>
                ))}
                <div className="text-center pt-2">
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-2 inline-block">
                    <QrCode className="w-12 h-12 text-orange-500 mx-auto" />
                    <div className="text-xs text-orange-600 font-medium mt-1">Scan to view full menu</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          {[
            { val: '5K+', label: 'Restaurants' },
            { val: '2M+', label: 'Menu Scans' },
            { val: '100%', label: 'Free Setup' },
            { val: '4.9★', label: 'Rating' },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-4xl font-extrabold">{s.val}</div>
              <div className="text-orange-100 font-medium mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-orange-500 font-bold text-sm uppercase tracking-widest mb-3">Features</div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              Everything you need to go <span className="gradient-text">digital</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              A complete platform to create, manage, and share your restaurant menu.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className={`${f.bg} rounded-2xl p-6 card-hover border border-transparent hover:border-orange-200`}>
                <div className="mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 bg-gradient-to-br from-orange-50 to-rose-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-orange-500 font-bold text-sm uppercase tracking-widest mb-3">Process</div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900">
              Up and running in <span className="gradient-text">4 steps</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl mx-auto mb-4 shadow-lg shadow-orange-200">
                  {s.num}
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900">Loved by restaurants <span className="gradient-text">worldwide</span> 🌍</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-2xl p-7 card-hover border border-orange-100">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center text-white font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-gray-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-orange-500 to-rose-600">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-4xl lg:text-5xl font-extrabold mb-6">
            Ready to go digital?
          </h2>
          <p className="text-orange-100 text-xl mb-10">
            Join thousands of restaurants already using MenuQR. Free forever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-orange-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-50 transition-all shadow-2xl inline-flex items-center gap-2"
            >
              Start for Free
              <ChevronRight size={20} />
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-orange-200 text-sm">
            {['No credit card', 'Setup in minutes', 'Cancel anytime'].map((item, i) => (
              <div key={i} className="flex items-center gap-1">
                <CheckCircle size={14} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold">MenuQR</span>
          </div>
          <p className="text-sm">© 2025 MenuQR. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <Link href="/login" className="hover:text-orange-400 transition-colors">Login</Link>
            <Link href="/register" className="hover:text-orange-400 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
