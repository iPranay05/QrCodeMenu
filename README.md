# 📲 MenuQR

**A digital menu platform for restaurants.** Owners build a mobile-friendly menu, share it through a branded QR code, and customers scan to browse and order from their phones. Update prices or items anytime and the change goes live instantly, with no reprinting, because the QR always points to the same link: `/menu/<slug>`.

🌐 **Live:** [qdishly.in](https://www.qdishly.in/)

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind 4 · Supabase · Groq · Razorpay

## Core Features

### 🍽️ Digital Menu
- **Menu builder:** categories, items, prices, descriptions, ingredients, photos and video links
- **Item details:** veg / non-veg tags, preparation time and availability toggle (mark items sold out instantly)
- **AI menu import:** upload a photo of a paper menu and get categories and items extracted automatically
- **Mobile-first public menu** at `/menu/<slug>`, with no app download needed
- **Table ordering:** customers place orders from their table, and owners manage them in an orders dashboard
- **Branding and themes:** logo, cover image, colors, layout themes, opening hours and delivery-platform links

### 📲 QR Code Designer
- Colors and gradients, dot and eye shapes, centre logo or icon
- Printable CTA frames ("Scan for Menu") and one-click presets
- Scan-safety checks, plus PNG, JPEG, SVG and PDF export
- Bulk per-table QR codes (`?table=N`) as a ZIP

**Also included:** 7-day trial with Razorpay subscription, referral ambassadors, admin panel.

## Quick Start

```bash
npm install
npm run dev     # http://localhost:3000
```

1. Run these in the Supabase SQL Editor, in order: `supabase-setup.sql`, `supabase-migration-prep-time.sql`, `supabase-migration-subscription.sql`, `supabase-migration-qr-design.sql`
2. Create two public Storage buckets: `menu-items` and `logos`
3. Add `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
GROQ_API_KEY=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
ADMIN_SECRET_KEY=
```
