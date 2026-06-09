'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
    targetDate: string;
    className?: string;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export default function CountdownTimer({ targetDate, className = '' }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(targetDate).getTime() - Date.now();
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    const units = [
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Min', value: timeLeft.minutes },
        { label: 'Sec', value: timeLeft.seconds },
    ];

    return (
        <div className={`flex gap-3 ${className}`}>
            {units.map((unit) => (
                <div key={unit.label} className="text-center">
                    <motion.div
                        key={unit.value}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        className="glass-card px-4 py-3 min-w-[60px]"
                    >
                        <span className="text-2xl font-display font-black text-slate-900">
                            {String(unit.value).padStart(2, '0')}
                        </span>
                    </motion.div>
                    <span className="text-xs text-slate-500 mt-2 block font-bold uppercase tracking-widest">{unit.label}</span>
                </div>
            ))}
        </div>
    );
}
