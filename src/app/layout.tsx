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

export const metadata: Metadata = {
  title: 'Support Our Cause',
  description: 'Support our cause with secure donations. Every contribution helps create an unforgettable experience.',
  keywords: ['donate', 'donation', 'fundraising'],
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
    title: 'Support Our Cause',
    description: 'Support our cause with secure donations. Every contribution helps create an unforgettable experience.',
    type: 'website',
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
