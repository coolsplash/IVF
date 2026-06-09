'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface VenmoButtonProps {
  amount: number;
  name: string;
  email: string;
  fundraiserId?: string;
  purpose?: string;
  note?: string;
  disabled?: boolean;
}

export default function VenmoButton({
  amount,
  name,
  email,
  fundraiserId,
  purpose,
  note,
  disabled = false,
}: VenmoButtonProps) {
  const handleVenmoPayment = () => {
    // Create a Venmo payment URL that opens the Venmo app
    const venmoUsername = process.env.NEXT_PUBLIC_VENMO_USERNAME || 'your-venmo-username';
    
    // Build the payment note
    let paymentNote = 'Donation';
    if (purpose) {
      paymentNote += ` for ${purpose.replace('-', ' ')}`;
    }
    if (note) {
      paymentNote += `. ${note}`;
    }
    
    // Venmo deep link format
    const venmoUrl = `venmo://paycharge?recipients=${venmoUsername}&amount=${amount}&note=${encodeURIComponent(paymentNote)}`;
    
    // Fallback to web version if deep link doesn't work
    const webUrl = `https://venmo.com/?txn=pay&recipients=${venmoUsername}&amount=${amount}&note=${encodeURIComponent(paymentNote)}`;
    
    // Try to open the app, fallback to web
    window.location.href = venmoUrl;
    
    // Set a timeout to redirect to web version if app doesn't open
    setTimeout(() => {
      window.location.href = webUrl;
    }, 2000);
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={handleVenmoPayment}
      disabled={disabled}
      className="w-full bg-[#008CFF] hover:bg-[#0077D9] text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
    >
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
      Pay with Venmo
    </motion.button>
  );
}
