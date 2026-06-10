'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [copied, setCopied] = useState(false);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative"
      style={{
        backgroundImage: "url('data:image/jpeg;base64,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')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Semi-transparent overlay to ensure text remains readable */}
      <div className="absolute inset-0 z-0 bg-white/30"></div>
      {/* Header section */}
      <div className="text-center max-w-2xl mx-auto mb-8 relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
          Help make a couple's dream come true and bring another child into this world
        </h1>
        <div className="space-y-2 mb-6">
          <p className="text-2xl md:text-3xl font-bold text-teal-700">
            Goal $40,000
          </p>
          <p className="text-lg md:text-xl text-slate-700 font-medium">
            Community Case Endorsed by Rabbi Maoz Harari Raful
          </p>
          <p className="text-base md:text-lg text-slate-600 font-semibold uppercase tracking-wide">
            Tax Deductible
          </p>
        </div>
        <p className="text-xl text-slate-600 font-medium">
          Choose your preferred way to give below.
        </p>
      </div>

      {/* Buttons section */}
      <div className="w-full max-w-md flex flex-col gap-4 relative z-10">

        {/* Credit Card Button */}
        <Link href="/donate" className="w-full">
          <button className="w-full py-5 text-xl bg-teal-600 text-white rounded-xl shadow-lg flex items-center justify-center gap-3 hover:bg-teal-700 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Donate with Credit Card
          </button>
        </Link>

        {/* Zelle Info Card */}
        <div className="bg-white p-6 rounded-2xl border-2 border-teal-600 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="teal">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-3H8v-3h3v-3h2v3h3v3h-3v3h-2z"/>
            </svg>
            <div>
              <p className="font-bold text-slate-900 text-lg">Donate with Zelle</p>
              <p className="text-xs text-slate-500">Fast, secure bank-to-bank transfers</p>
            </div>
          </div>

          {/* Contact Info Display */}
          <div className="bg-slate-100 border-2 border-teal-600 rounded-xl p-4 mb-4">
            <p className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">Send to:</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-black text-slate-900">
                {process.env.NEXT_PUBLIC_ZELLE_PHONE || process.env.NEXT_PUBLIC_ZELLE_EMAIL || 'YOUR_PHONE_NUMBER'}
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(process.env.NEXT_PUBLIC_ZELLE_PHONE || process.env.NEXT_PUBLIC_ZELLE_EMAIL || 'YOUR_PHONE_NUMBER');
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-slate-600 hover:text-slate-900 font-bold text-sm flex items-center gap-1"
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>

          {/* Step-by-step Instructions */}
          <div className="bg-slate-50 border border-slate-300 rounded-xl p-4">
            <p className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">How to pay:</p>
            <ol className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="bg-teal-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <span>Open your banking app or Zelle</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-teal-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <span>Select "Send" or "Pay"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-teal-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <span>Enter the phone number above</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-teal-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                <span>Send your donation amount</span>
              </li>
            </ol>
          </div>
        </div>
      </div>

    </div>
  );
}
