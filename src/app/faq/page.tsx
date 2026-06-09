'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const faqCategories = [
    {
        category: 'General',
        icon: '💡',
        items: [
            {
                question: 'What is this fundraiser?',
                answer: 'This is our personal fundraising platform to support our cause. Every dollar goes directly toward our project expenses.',
            },
            {
                question: 'Where does my donation go?',
                answer: 'All donations go directly toward funding our cause — covering our transportation, meals, accommodation, programming, and supplies.',
            },
            {
                question: 'Is this donation secure?',
                answer: 'Yes! We use a secure payment gateway to process all contributions. Your support means the world to us and helps make this dream a reality.',
            },
        ],
    },
    {
        category: 'Donating',
        icon: '💰',
        items: [
            {
                question: 'What are the donation options?',
                answer: 'We offer preset amounts ($18, $36, $54, $100, $180, $360) or you can enter any custom amount. Every dollar counts!',
            },
            {
                question: 'Is there a minimum donation?',
                answer: 'There is no minimum — any amount is greatly appreciated and makes a meaningful difference.',
            },
            {
                question: 'Can I donate multiple times?',
                answer: 'Absolutely! You can return and donate as many times as you wish. Each donation is processed separately.',
            },
            {
                question: 'What happens if my payment fails?',
                answer: 'If the payment fails for any reason, no donation is recorded. You can try again with a different payment method.',
            },
        ],
    },
    {
        category: 'Payments & Security',
        icon: '🔒',
        items: [
            {
                question: 'Is my payment information secure?',
                answer: 'Yes. All payments are processed through Banquest, an industry-leading payment processor with PCI DSS compliance. We never store your credit card information on our servers.',
            },
            {
                question: 'Will I receive a receipt?',
                answer: 'Yes, after donating you can request a receipt sent to your email. This can be used for tax deduction purposes.',
            },
            {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit and debit cards including Visa, Mastercard, American Express, and Discover.',
            },
            {
                question: 'Can I get a refund?',
                answer: 'As donations are charitable contributions, refunds are generally not available. Please contact us if you have concerns about a specific transaction.',
            },
        ],
    },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card overflow-hidden"
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
            >
                <span className="text-slate-900 font-bold px-1">{question}</span>
                <motion.svg
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-5 h-5 text-slate-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </motion.svg>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 text-slate-500 text-sm font-medium leading-relaxed border-t border-slate-100 pt-4">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function FAQPage() {
    return (
        <div className="relative min-h-screen">
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
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 right-1/3 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative section-padding max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl sm:text-5xl font-display font-black text-slate-900 mb-4"
                    >
                        Frequently Asked <span className="gradient-text">Questions</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-500 text-lg font-medium"
                    >
                        Everything you need to know about donating
                    </motion.p>
                </div>

                {/* FAQ Categories */}
                <div className="space-y-12">
                    {faqCategories.map((category) => (
                        <div key={category.category}>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl">{category.icon}</span>
                                <h2 className="text-xl font-display font-black text-slate-900">
                                    {category.category}
                                </h2>
                            </div>
                            <div className="space-y-3">
                                {category.items.map((item) => (
                                    <FAQItem key={item.question} {...item} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="glass-card p-6 md:p-8 mt-16 text-center"
                >
                    <h3 className="text-xl font-display font-black text-slate-900 mb-3">
                        Still have questions?
                    </h3>
                    <p className="text-slate-500 font-medium mb-6">
                        We&apos;re here to help. Reach out to us anytime.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/donate">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn-primary"
                            >
                                ❤️ Start Donating
                            </motion.button>
                        </Link>
                        <Link href="/donate">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn-secondary"
                            >
                                ✉️ Contact Us
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
