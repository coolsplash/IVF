'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const steps = [
    {
        number: '01',
        title: 'Choose Your Amount',
        description: 'Select from our curated preset amounts or enter any custom amount that works for you. Every dollar counts toward making this cause possible.',
        icon: '💰',
        bg: 'bg-primary-50',
        textColor: 'text-primary-700',
        features: ['Preset suggestions', 'Custom amounts welcome', 'No minimum required'],
    },
    {
        number: '02',
        title: 'Enter Your Details',
        description: 'Provide your name, email, and payment information. All data is encrypted end-to-end and processed through our secure payment gateway.',
        icon: '🔒',
        bg: 'bg-blue-50',
        textColor: 'text-blue-700',
        features: ['256-bit SSL encryption', 'PCI DSS compliant', 'No data stored on our servers'],
    },
    {
        number: '03',
        title: 'Instant Confirmation',
        description: 'Your donation is processed instantly. You\'ll receive a confirmation number on screen and can request a detailed receipt sent directly to your email.',
        icon: '✅',
        bg: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        features: ['Instant processing', 'Email receipt', 'Tax-deductible'],
    },
];

const faqs = [
    {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit and debit cards including Visa, Mastercard, American Express, and Discover.',
    },
    {
        q: 'Is my donation tax-deductible?',
        a: 'Yes! All donations are tax-deductible. You will receive a receipt via email for your records.',
    },
    {
        q: 'Is my payment information secure?',
        a: 'Absolutely. All payments are processed through Banquest, an industry-leading payment processor with PCI DSS compliance.',
    },
    {
        q: 'Where does my donation go?',
        a: 'All donations go directly toward funding our cause — covering transportation, meals, accommodation, and programming.',
    },
];

export default function HowItWorksPage() {
    return (
        <div className="relative bg-surface-100 min-h-screen pt-20 pb-20">
            {/* Back Button */}
            <motion.button
                onClick={() => window.history.back()}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="fixed top-4 left-4 md:top-8 md:left-8 z-50 bg-white/90 backdrop-blur-sm text-slate-800 p-2 md:p-3 rounded-xl shadow-lg border border-slate-200 hover:bg-white hover:shadow-xl transition-all"
            >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </motion.button>

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary-100/40 rounded-full blur-[140px]" />
                <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-accent-100/30 rounded-full blur-[140px]" />
            </div>

            {/* Header */}
            <section className="relative section-padding pb-0 pt-16">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-white px-5 py-2.5 rounded-full mb-8 shadow-sm border border-slate-200"
                    >
                        <span className="text-sm font-semibold text-slate-600 tracking-wide">📖 Simple & Transparent</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl sm:text-6xl md:text-7xl font-display font-black text-slate-900 mb-6 tracking-tight"
                    >
                        How <span className="gradient-text">Donating</span> Works
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl font-medium text-slate-500 max-w-2xl mx-auto"
                    >
                        Three simple steps to make a meaningful contribution.
                        Your donation is processed securely and instantly.
                    </motion.p>
                </div>
            </section>

            {/* Steps */}
            <section className="relative section-padding">
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="bg-white p-6 md:p-12 relative overflow-hidden group shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 hover:shadow-2xl hover:border-primary-100 transition-all duration-300"
                            >
                                <div className="relative pl-6 md:pl-10">
                                {/* Vertical accent line */}
                                <div className={`absolute top-0 left-0 w-2 h-full ${step.bg} rounded-full`} />
                                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                                    <div className="flex-shrink-0">
                                        <div className={`w-20 h-20 rounded-2xl ${step.bg} flex items-center justify-center text-4xl shadow-inner border border-white`}>
                                            {step.icon}
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className={`${step.textColor} font-display text-sm font-bold tracking-widest uppercase bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100`}>
                                                STEP {step.number}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-display font-black text-slate-900 mb-4">
                                            {step.title}
                                        </h3>
                                        <p className="text-slate-500 text-lg font-medium leading-relaxed mb-6">
                                            {step.description}
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            {step.features.map((feature) => (
                                                <span
                                                    key={feature}
                                                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl"
                                                >
                                                    <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Preview */}
            <section className="relative section-padding bg-white border-y border-slate-200">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 mb-4">
                            Quick Questions
                        </h2>
                        <p className="text-slate-500 text-lg font-medium">Everything you need to know about donating.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm"
                            >
                                <h4 className="text-slate-900 font-bold text-xl mb-3">{faq.q}</h4>
                                <p className="text-slate-500 font-medium leading-relaxed">{faq.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative section-padding pb-32 pt-24">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-primary-600 rounded-3xl md:rounded-[3rem] p-8 md:p-20 shadow-2xl text-white relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl" />

                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-display font-black mb-6">
                                Ready to Give?
                            </h2>
                            <p className="text-white/80 text-xl font-medium mb-10 max-w-lg mx-auto">
                                Your donation directly supports our trip. Make an impact today.
                            </p>
                            <Link href="/donate">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-white text-slate-900 font-bold text-xl px-12 py-5 rounded-2xl shadow-xl hover:shadow-white/20 transition-all border-none"
                                >
                                    Donate Now →
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
