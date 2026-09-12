import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MenuQR — Digital Menus for Restaurants",
  description:
    "Create beautiful digital menus for your restaurant. Generate a QR code and let customers browse your menu on their phone.",
  keywords: "restaurant menu, QR code menu, digital menu, online menu",
  openGraph: {
    title: 'MenuQR — Digital Menus for Restaurants',
    description: 'Create beautiful digital menus for your restaurant. Generate a QR code and let customers browse your menu on their phone.',
    url: 'https://menuqr.com',
    siteName: 'MenuQR',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop', // Temporary OG image placeholder
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
 }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-white text-gray-900 antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fff",
              color: "#1a1a1a",
              boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
              borderRadius: "12px",
              fontFamily: "var(--font-sans), system-ui, sans-serif",
              fontWeight: "500",
            },
            success: {
              iconTheme: { primary: "#22c55e", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}

