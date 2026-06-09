export const runtime = 'edge';

import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const raffle = {
            prizeAmount: 7000,
            goalAmount: 10000,
            drawingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true,
            winner: null
        };

        return NextResponse.json(raffle);
    } catch (error) {
        console.error('Error fetching raffle:', error);
        return NextResponse.json({ error: 'Failed to fetch raffle' }, { status: 500 });
    }
}
