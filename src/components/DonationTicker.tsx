'use client';

import { useEffect, useState } from 'react';
import { Donation } from '@/types';

interface DonationTickerProps {
    donations: Donation[];
}

export default function DonationTicker({ donations }: DonationTickerProps) {
    const [items, setItems] = useState<Donation[]>([]);

    useEffect(() => {
        if (donations.length > 0) {
            // Double the items for seamless loop
            setItems([...donations, ...donations]);
        }
    }, [donations]);

    if (items.length === 0) return null;

    return (
        <div className="w-full overflow-hidden py-4 bg-primary-900/10 border-y border-primary-500/10">
            <div className="ticker-wrapper relative">
                <div className="ticker-content">
                    {items.map((donation, index) => (
                        <div
                            key={`${donation.id}-${index}`}
                            className="flex items-center gap-2 text-sm whitespace-nowrap"
                        >
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-soft" />
                            <span className="text-white/70 font-medium">{donation.name}</span>
                            <span className="text-white/40">donated</span>
                            <span className="text-primary-400 font-bold">${donation.amount}</span>
                            <span className="text-white/20 mx-2">•</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
