export const runtime = 'edge';

import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const stats = {
            totalRaised: 0,
            totalDonations: 0,
            goal: 10000,
            recentDonations: [],
            topDonors: [],
            donatedPurposes: [],
            purposeNotes: {},
            donationCards: [
                { id: 'melaveh-malkah', name: 'Melaveh Malkah', description: 'Saturday night gathering', emoji: '🌙', price: 180, slug: 'melaveh-malkah', is_sponsored: false },
                { id: 'kiddush', name: 'Kiddush', description: 'Shabbat refreshments', emoji: '🍷', price: 100, slug: 'kiddush', is_sponsored: false },
                { id: 'seudah-shlishit', name: 'Seudah Shlishit', description: 'Third Shabbat meal', emoji: '🥖', price: 50, slug: 'seudah-shlishit', is_sponsored: false },
                { id: 'transportation', name: 'Transportation', description: 'Travel costs', emoji: '🚌', price: 200, slug: 'transportation', is_sponsored: false },
                { id: 'activities', name: 'Activities', description: 'Programs & activities', emoji: '🎯', price: 150, slug: 'activities', is_sponsored: false },
                { id: 'general', name: 'General Support', description: 'Flexible donation', emoji: '💝', price: 50, slug: 'general', is_sponsored: false },
            ],
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
