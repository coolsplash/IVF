'use client';

import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

interface StatsCardProps {
    icon: ReactNode;
    label: string;
    value: string | number;
    subtext?: string;
    gradient?: string;
    delay?: number;
}

export default function StatsCard({ icon, label, value, subtext, gradient, delay = 0 }: StatsCardProps) {
    const variants: Variants = {
        hidden: { opacity: 0, y: 50, scale: 0.9 },
        show: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: {
                type: 'spring',
                damping: 15,
                stiffness: 100
            }
        }
    };

    return (
        <motion.div
            variants={variants}
            className="stat-card group cursor-default"
        >
            <div
                className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-white ${gradient || 'bg-primary-500'
                    }`}
            >
                {icon}
            </div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{label}</p>
            <p className="text-3xl font-display font-black text-slate-900">{value}</p>
            {subtext && <p className="text-slate-400 text-xs mt-1 font-medium">{subtext}</p>}
        </motion.div>
    );
}
