'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
    current: number;
    goal: number;
    className?: string;
}

export default function ProgressBar({ current, goal, className = "" }: ProgressBarProps) {
    const percentage = Math.min(Math.round((current / goal) * 100), 100);
    const isOverGoal = current > goal;

    return (
        <div className={`w-full px-4 ${className}`}>
            <div className="relative h-8 md:h-10 w-full bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)] p-1.5 mb-3">
                {/* Background Track with subtle pattern */}
                <div className="absolute inset-0 opacity-10 bg-grid-white" />
                
                {/* Progress Fill */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                    className={`relative h-full rounded-xl flex items-center justify-end px-3 overflow-hidden`}
                    style={{
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
                    }}
                >
                    {/* Pulsing Glow Animation */}
                    <motion.div
                        animate={{
                            opacity: [0.4, 0.8, 0.4],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute inset-0 bg-emerald-400/20 blur-xl"
                    />

                    {/* Animated Shine Effect */}
                    <motion.div
                        animate={{
                            x: ['-200%', '200%'],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full skew-x-12"
                    />

                    {/* Glossy Top Highlight */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-40" />
                    
                    {/* Percentage Label */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="relative z-10 flex items-center gap-1"
                    >
                        <span className="text-white font-display font-black text-sm md:text-base tracking-tighter drop-shadow-md">
                            {percentage}%
                        </span>
                        {isOverGoal && <span className="text-white text-xs">🚀</span>}
                    </motion.div>
                </motion.div>
            </div>

            <div className="flex justify-between items-end mb-2">
                <div className="flex flex-col items-start">
                    <span className="text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] mb-1 ml-1">Current Progress</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl md:text-4xl font-display font-black text-slate-900 tracking-tighter leading-none">
                            ${current.toLocaleString()}
                        </span>
                        <span className="text-slate-500 font-display font-bold italic text-sm">
                            raised
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 mr-1">Target Goal</span>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl md:text-3xl font-display font-black text-slate-900 tracking-tight opacity-75">
                            ${goal.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Sub-text matched to screenshot */}
            <div className="flex justify-center mt-3">
                <p className="text-slate-600 font-display font-black text-[11px] tracking-[0.2em] uppercase bg-white/50 backdrop-blur-sm px-4 py-1 rounded-full border border-slate-200/50">
                    Help us reach our target of ${goal.toLocaleString()}
                </p>
            </div>
        </div>
    );
}
