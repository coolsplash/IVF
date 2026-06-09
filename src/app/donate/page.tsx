'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'amount' | 'info' | 'result';

interface DonationResult {
  amount: number;
  message: string;
}

const PRESET_AMOUNTS = [18, 26, 36, 52, 86, 101, 180, 201, 301, 501, 1000, 2000];

function DonateForm() {
  const searchParams = useSearchParams();
  const preselectedAmount = searchParams.get('amount');
  const shouldFocusCustom = searchParams.get('custom') === 'true';
  const fundraiserId = searchParams.get('fundraiserId');
  const purpose = searchParams.get('purpose');

  // Use a ref to track if we've already handled the initial purpose redirect
  const hasRedirected = React.useRef(false);

  const [step, setStep] = useState<Step>(purpose ? 'info' : 'amount');

  // If we have a purpose, ensure we never even render the amount step in the background
  useEffect(() => {
    if (purpose && !hasRedirected.current) {
      setStep('info');
      hasRedirected.current = true;
    }
  }, [purpose]);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(
    preselectedAmount ? Number(preselectedAmount) : null
  );
  const [customAmount, setCustomAmount] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [note, setNote] = useState('');
  const customInputRef = React.useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [donationResult, setDonationResult] = useState<DonationResult | null>(null);
  const [receiptStatus, setReceiptStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [donationCards, setDonationCards] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'card'>('card');

  // Fetch donation cards to check sponsorship status
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch('/api/donations');
        const data = await res.json();
        if (data.donationCards) {
          setDonationCards(data.donationCards);
        }
      } catch (err) {
        console.error('Error fetching cards:', err);
      }
    };
    fetchCards();
  }, []);

  // If preselected with an amount OR purpose, skip to info step
  useEffect(() => {
    const hasAmount = preselectedAmount && Number(preselectedAmount) > 0;
    
    if (hasAmount || purpose) {
      if (hasAmount) {
        setSelectedAmount(Number(preselectedAmount));
        setCustomAmount('');
      }
      
      // If it's a specific purpose donation, go straight to info/payment step
      if (purpose) {
        setStep('info');
      }
    }
  }, [preselectedAmount, purpose]);

  // Focus custom input if coming from custom button
  useEffect(() => {
    if (shouldFocusCustom && customInputRef.current && step === 'amount') {
      customInputRef.current.focus();
    }
  }, [shouldFocusCustom, step]);

  const getDonationAmount = (): number => {
    if (selectedAmount) return selectedAmount;
    return Number(customAmount) || 0;
  };

  const formatCardNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const formatExpiry = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 2) {
      let month = digits.slice(0, 2);
      const year = digits.slice(2);
      const monthNum = parseInt(month, 10);
      if (monthNum > 12) month = '12';
      else if (monthNum === 0 && month.length === 2) month = '01';
      return year ? month + '/' + year : month;
    }
    return digits;
  };

  const handleAmountContinue = () => {
    const amount = getDonationAmount();
    if (!amount || amount <= 0) {
      setError('Please select or enter a donation amount.');
      return;
    }
    setError('');
    setStep('info');
  };

  const handleDonateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim()) {
      setError('Please fill in your name and email.');
      return;
    }

    if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim()) {
      setError('Please fill in all payment details.');
      return;
    }

    setIsProcessing(true);

    try {
      const amount = getDonationAmount();
      console.log(`[DonateForm] Submitting payment for $${amount}`);

      const response = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          amount,
          paymentDetails: {
            cc_number: cardNumber.replace(/\s/g, ''),
            cc_exp: cardExpiry.replace('/', ''),
            cc_cvv: cardCvc,
          },
          fundraiserId,
          purpose,
          note,
        }),
      });

      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('[DonateForm] Non-JSON Error Response:', text);
        if (response.status === 401 || text.includes('Unauthorized')) {
          throw new Error('Payment gateway authentication failed. Please check the server configuration.');
        }
        throw new Error(text || `Server error: ${response.status}`);
      }

      if (!response.ok) {
        console.error('[DonateForm] API Error:', data);
        const errorMessage = data.error || data.message || 'Failed to process donation';
        const debugInfo = data.debug ? `\n\nDebug Info: ${data.debug}` : '';
        throw new Error(`${errorMessage}${debugInfo}`);
      }

      console.log('[DonateForm] Success:', data);
      setDonationResult({
        amount: data.amount,
        message: data.message,
      });
      setStep('result');
    } catch (err) {
      console.error('[DonateForm] Catch Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendReceipt = async () => {
    if (!donationResult) return;
    setReceiptStatus('sending');
    setError('');

    try {
      const response = await fetch('/api/donate/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          ticketNumbers: [],
          totalAmount: donationResult.amount,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send receipt');
      }
      setReceiptStatus('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send receipt.');
      setReceiptStatus('error');
    }
  };

  const handleDonateAgain = () => {
    setDonationResult(null);
    setSelectedAmount(null);
    setCustomAmount('');
    setReceiptStatus('idle');
    setStep('amount');
  };

  const stepIndex = step === 'amount' ? 0 : step === 'info' ? 1 : 2;

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <motion.button
        onClick={() => {
          if (purpose) {
            // Force return to home for purpose donations
            window.location.href = '/';
          } else if (step === 'info') {
            setStep('amount');
          } else {
            window.location.href = '/';
          }
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed top-4 left-4 md:top-8 md:left-8 z-50 bg-white/90 backdrop-blur-sm text-slate-800 p-2 md:p-3 rounded-xl shadow-lg border border-slate-200 hover:bg-white hover:shadow-xl transition-all"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </motion.button>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-primary-500/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-500/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-dots opacity-30" />
      </div>

      <div className="container mx-auto max-w-4xl px-6 py-4">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {(['amount', 'info', 'result'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 shadow-sm ${
                  stepIndex === i
                    ? 'bg-primary-500 text-white shadow-primary-500/30'
                    : stepIndex > i
                    ? 'bg-primary-500/50 text-white'
                    : 'bg-white/60 text-slate-500 border border-slate-300'
                }`}
              >
                {stepIndex > i ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && (
                <div
                  className={`w-16 sm:w-24 h-1 rounded-full transition-all duration-500 ${
                    stepIndex > i ? 'bg-primary-500/50' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Choose Amount */}
          {step === 'amount' && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-1 md:mb-2">
                <h1 className="text-2xl md:text-3xl font-display font-black text-slate-900 mb-2">Choose Your Amount</h1>
                <p className="text-slate-500 text-lg font-medium">Select a preset or enter a custom amount</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {PRESET_AMOUNTS.map((amount) => (
                  <motion.button
                    key={amount}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount('');
                      setError('');
                    }}
                    className={`py-4 md:py-5 rounded-2xl font-display font-black text-lg md:text-xl transition-all duration-200 border-2 shadow-sm ${
                      selectedAmount === amount
                        ? 'bg-teal-600 text-white border-teal-600 scale-[1.02]'
                        : 'bg-white text-slate-800 border-slate-300 hover:border-teal-600 hover:shadow-md'
                    }`}
                  >
                    ${amount}
                  </motion.button>
                ))}
              </div>

              <div className="relative mb-4">
                <p className="text-center text-slate-400 text-sm font-bold mb-4">OR ENTER CUSTOM AMOUNT</p>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">$</span>
                  <input
                    type="number"
                    min="1"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                      setError('');
                    }}
                    placeholder="Enter amount"
                    className="input-field pl-10 py-3 text-lg font-display font-bold text-center"
                    id="custom-amount"
                    ref={customInputRef}
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium text-center border border-red-100 mb-4">
                  {error}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAmountContinue}
                className="w-full py-5 text-xl bg-teal-600 text-white rounded-xl shadow-lg hover:bg-teal-700 transition-colors"
              >
                Continue →
              </motion.button>

              <p className="text-center text-slate-400 text-sm mt-6">
                🔒 All transactions are secured with enterprise-grade encryption
              </p>
            </motion.div>
          )}

          {/* Step 2: Info & Payment */}
          {step === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-6 md:mb-8">
                <h1 className="text-3xl md:text-4xl font-display font-black text-slate-900 mb-2">Complete Donation</h1>
                <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-5 py-2 rounded-full text-sm font-bold border border-primary-100 mt-2">
                  Donating <span className="text-2xl font-display font-black">${getDonationAmount()}</span>
                </div>
                {purpose && (
                  <div className="mt-4 bg-primary-100 text-primary-800 px-6 py-3 rounded-xl text-lg font-black uppercase tracking-wide border-2 border-primary-200">
                    For: {purpose.replace('-', ' ')}
                  </div>
                )}
              </div>

              <form onSubmit={handleDonateSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm text-slate-800 mb-2 font-bold uppercase tracking-wide">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="input-field py-4"
                    id="donor-name"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-800 mb-2 font-bold uppercase tracking-wide">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="input-field py-4"
                    id="donor-email"
                  />
                </div>

                {purpose && purpose !== 'sponsor-1-boy' && (
                  <div className="bg-primary-50 p-5 rounded-2xl border-2 border-primary-200">
                    <label className="block text-sm text-primary-800 mb-2 font-bold uppercase tracking-wide">Note (optional)</label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="e.g., Leilui Nishmat, Refuah Shelemah..."
                      className="w-full bg-white border-2 border-primary-300 rounded-xl py-4 px-5 text-slate-900 font-black focus:ring-2 focus:ring-primary-500 focus:outline-none text-lg transition-all placeholder:text-slate-400"
                      id="donor-note"
                    />
                    <p className="text-xs text-primary-600 mt-2 font-medium">Add a dedication for this purpose</p>
                  </div>
                )}

                {/* Payment Details */}
                <div>
                  <label className="block text-sm text-slate-800 mb-2 font-bold uppercase tracking-wide">Payment Details</label>

                  {/* Card Payment Form */}
                  <div className="bg-white p-5 rounded-2xl border-2 border-teal-600 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <svg className="w-10 h-6" viewBox="0 0 50 32">
                            <rect width="50" height="32" rx="4" fill="#1A1F71"/>
                            <path d="M19.5 20.5h-2.8l1.8-11h2.8l-1.8 11zm8.5-10.7c-.5-.2-1.4-.4-2.5-.4-2.8 0-4.7 1.4-4.7 3.4 0 1.5 1.4 2.3 2.4 2.8 1.1.5 1.4.9 1.4 1.4 0 .7-.9 1.1-1.7 1.1-1.1 0-1.7-.2-2.7-.5l-.4-.2-.4 2.3c.7.3 1.9.5 3.2.5 3 0 4.9-1.4 4.9-3.6 0-1.2-.7-2.1-2.3-2.8-.9-.5-1.5-.7-1.5-1.3 0-.4.5-.9 1.6-.9.9 0 1.6.2 2.1.3l.3.1.4-2.3z" fill="white"/>
                            <path d="M33.8 9.8h-2.1c-.7 0-1.1.2-1.4.8l-4 9.3h3l.6-1.6h3.7l.3 1.6h2.6l-2.7-9.3zm-3.5 6l1.2-3.1.6 3.1h-1.8zM16.8 9.8l-2.6 6.4-.3-1.4c-.5-1.6-2-3.3-3.6-4.2l2.4 8.3h3 l4.4-9.1h-3.3z" fill="white"/>
                            <path d="M10 9.8H5.6l-.1.3c3.4.9 5.7 3 6.6 5.5l-.9-5c-.2-.6-.6-.8-1.2-.8z" fill="#F9A533"/>
                          </svg>
                          <svg className="w-10 h-6" viewBox="0 0 50 32">
                            <rect width="50" height="32" rx="4" fill="#000"/>
                            <circle cx="17" cy="16" r="8" fill="#EB001B"/>
                            <circle cx="33" cy="16" r="8" fill="#F79E1B"/>
                            <path d="M25 10.5a8 8 0 000 11 8 8 0 000-11z" fill="#FF5F00"/>
                          </svg>
                          <svg className="w-10 h-6" viewBox="0 0 50 32">
                            <rect width="50" height="32" rx="4" fill="#006FCF"/>
                            <path d="M5 8h12c4.5 0 7 2.2 7 5.5 0 3-2 5-5 5.5l6 8.5H17l-5-8H9v8H5V8zm5 7h5c2 0 3-.8 3-2s-1-2-3-2h-5v4z" fill="white"/>
                          </svg>
                          <svg className="w-10 h-6" viewBox="0 0 50 32">
                            <rect width="50" height="32" rx="4" fill="#FF6000"/>
                            <circle cx="25" cy="16" r="9" fill="white"/>
                            <path d="M25 9c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm0 12c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" fill="#FF6000"/>
                            <path d="M22 13h6v3h-6v-3z" fill="#FF6000"/>
                          </svg>
                        </div>
                        <span className="text-slate-400 text-xs font-medium ml-auto">Secured by Banquest</span>
                      </div>
                      <div className="mb-3">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder="Card Number"
                          className="input-field py-4"
                          maxLength={19}
                          id="card-number"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                            placeholder="MM / YY"
                            className="input-field py-4"
                            maxLength={7}
                            id="card-expiry"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="CVV"
                            className="input-field py-4"
                            maxLength={4}
                            id="card-cvc"
                          />
                        </div>
                      </div>
                    </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium text-center border border-red-100">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      if (purpose) {
                        window.location.href = '/';
                      } else {
                        setStep('amount');
                      }
                    }}
                    className="btn-secondary py-4 px-6"
                    disabled={isProcessing}
                  >
                    ← Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    id="donate-submit-btn"
                    disabled={isProcessing}
                    className="flex-1 py-4 text-lg bg-teal-600 text-white rounded-xl shadow-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      `Donate $${getDonationAmount()}`
                    )}
                  </motion.button>
                </div>
              </form>

              <p className="text-center text-slate-400 text-sm mt-6 pb-8">
                🔒 Enterprise-grade encryption • Tax-deductible donation
              </p>
            </motion.div>
          )}

          {/* Step 3: Result */}
          {step === 'result' && donationResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
              className="max-w-xl mx-auto text-center"
            >
              <div className="bg-white rounded-3xl md:rounded-[2rem] p-6 md:p-12 shadow-2xl shadow-primary-500/10 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-50 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-emerald-100">
                    <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  <h1 className="text-4xl font-display font-black text-slate-900 mb-2">Thank You!</h1>
                  <p className="text-slate-500 text-lg mb-8 font-medium">Your donation has been processed successfully</p>

                  <div className="bg-slate-50 rounded-3xl p-8 mb-8 border border-slate-100 shadow-inner">
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Amount Donated</p>
                    <p className="text-4xl md:text-6xl font-display font-black gradient-text mb-6 pb-1">
                      ${donationResult.amount}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-4 max-w-sm mx-auto">
                    {receiptStatus !== 'sent' ? (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSendReceipt}
                        className="w-full py-4 text-lg bg-teal-600 text-white rounded-xl shadow-lg hover:bg-teal-700 transition-colors"
                        disabled={receiptStatus === 'sending'}
                      >
                        {receiptStatus === 'sending' ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending Receipt...
                          </span>
                        ) : (
                          '📧 Send Receipt to Email'
                        )}
                      </motion.button>
                    ) : (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-emerald-700 font-bold flex items-center justify-center gap-2">
                        <span>✅ Receipt sent to {email}</span>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleDonateAgain}
                        className="btn-secondary flex-1 py-4 text-base"
                      >
                        Donate Again
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: 'I just donated!',
                              text: `I just donated to support our cause! Join me at`,
                              url: window.location.origin,
                            });
                          } else {
                            navigator.clipboard.writeText(
                              `I just donated to support our cause! Donate at ${window.location.origin}`,
                            );
                            alert('Link copied to clipboard!');
                          }
                        }}
                        className="btn-secondary flex-1 py-4 text-base"
                      >
                        📤 Share
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function DonatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    }>
      <DonateForm />
    </Suspense>
  );
}
