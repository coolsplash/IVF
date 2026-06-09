'use client';

import { useEffect, useState, use } from 'react';

export const runtime = 'edge';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ProgressBar from '@/components/ProgressBar';

interface Donor {
    id: string;
    name: string;
    amount: number;
    timestamp: string;
}

interface FundraiserData {
    fundraiser: {
        id: string;
        name: string;
        slug: string;
        goal: number;
        totalRaised: number;
        totalDonations: number;
        donors: Donor[];
    };
    globalGoal: number;
}

export default function FundraiserPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
    const params = use(paramsPromise);
    const [data, setData] = useState<FundraiserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFundraiser = async () => {
            try {
                const res = await fetch(`/api/fundraisers/${params.slug}`);
                if (!res.ok) {
                    if (res.status === 404) {
                        setError('Fundraiser not found');
                    } else {
                        setError('Failed to load fundraiser');
                    }
                    setIsLoading(false);
                    return;
                }
                const json = await res.json();
                console.log('[FundraiserPage] Fetched data:', json);
                setData(json);
                setError(null);
            } catch (err) {
                setError('An error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchFundraiser();
        const interval = setInterval(fetchFundraiser, 15000);
        return () => clearInterval(interval);
    }, [params.slug]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full" 
                />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
                <h1 className="text-4xl font-black mb-4">404</h1>
                <p className="text-xl text-slate-600 mb-8">{error || 'Page not found'}</p>
                <Link href="/">
                    <button className="btn-primary px-8 py-3 rounded-xl shadow-lg">Back to Home</button>
                </Link>
            </div>
        );
    }

    const { fundraiser } = data;
    const firstName = fundraiser.name.split(' ')[0];
    const progressPercent = fundraiser.goal > 0 ? Math.min(Math.round((fundraiser.totalRaised / fundraiser.goal) * 100), 100) : 0;

    return (
        <div className="min-h-screen bg-white overflow-x-hidden font-sans selection:bg-primary-100 selection:text-primary-900">
            {/* Subtle Gradient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-primary-50/50 to-white" />
            </div>

            <main className="relative z-10 max-w-2xl mx-auto px-6 pt-10 pb-32">
                {/* Header Section - Moved up and removed icon */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight">
                        Support <span className="text-primary-600">{fundraiser.name}</span>
                    </h1>
                     <p className="text-lg text-slate-500 font-medium tracking-tight">Helping our cause thrive</p>
                </motion.div>

                {/* Progress Bar Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <div className="flex justify-between items-end mb-4 px-1">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900">${fundraiser.totalRaised.toLocaleString()}</span>
                            <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">Raised</span>
                        </div>
                        <div className="text-right">
                            <span className="text-primary-600 font-black text-sm">{progressPercent}%</span>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">of ${fundraiser.goal.toLocaleString()} goal</p>
                        </div>
                    </div>
                    <div className="h-6 bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-primary-600 rounded-full shadow-lg relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Main Action Button */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-16"
                >
                    <Link href={`/donate?fundraiserId=${fundraiser.id}`}>
                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-primary-600 text-white text-2xl font-black py-8 rounded-3xl shadow-[0_20px_50px_rgba(13,148,136,0.2)] hover:shadow-[0_25px_60px_rgba(13,148,136,0.3)] transition-all flex items-center justify-center gap-3 group"
                        >
                            Donate to {firstName}'s Goal
                            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </motion.button>
                    </Link>
                </motion.div>

                {/* Donors List */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex items-center gap-4 mb-6">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Recent Supporters</h2>
                        <div className="h-px flex-1 bg-slate-100" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{fundraiser.totalDonations} Donors</span>
                    </div>

                    <div className="space-y-3">
                        {fundraiser.donors.length === 0 ? (
                            <div className="py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                                <p className="text-slate-400 font-bold text-sm">Be the first to support {firstName}!</p>
                            </div>
                        ) : (
                            fundraiser.donors.map((donor, idx) => (
                                <motion.div
                                    key={donor.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + idx * 0.05 }}
                                    className="flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-100 hover:border-primary-200 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-bold text-sm group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                            {donor.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{donor.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                {new Date(donor.timestamp).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-slate-900 tabular-nums">${donor.amount.toLocaleString()}</p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
