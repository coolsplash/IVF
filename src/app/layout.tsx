import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import Chrome from '@/components/Chrome';
import Script from 'next/script';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const siteTitle =
  "Help make a couple's dream come true and bring another child into this world";

const siteDescription = `Goal $40,000

Community Case Endorsed by Rabbi Maoz Harari Raful

Tax Deductible`;

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ivf.coolsplash.com';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: siteTitle,
  description: siteDescription,
  keywords: ['donate', 'donation', 'fundraising', 'IVF', 'community'],
  icons: {
    icon: [
      { url: '/favicon.png?v=8' },
      { url: '/favicon-32x32.png?v=8', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png?v=8', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png?v=8', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: 'website',
    url: baseUrl,
    siteName: siteTitle,
    images: [
      {
        url: '/og-baby.jpg',
        width: 1200,
        height: 630,
        alt: siteTitle,
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: ['/og-baby.jpg'],
  },
  verification: {
    google: 'lbrSkc-B4r55dJ0kEt6E_QOMtpwR8RE5vNtX7cWmFrM',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col bg-surface-100 antialiased font-body">
        <Chrome>
          {children}
        </Chrome>
      </body>
    </html>
  );
}
