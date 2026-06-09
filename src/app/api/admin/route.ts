import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
    console.log('[AdminAPI] GET request received - Supabase disabled');

    try {
        const stats = {
            totalRaised: 0,
            siteRaised: 0,
            adminRaised: 0,
            totalDonations: 0,
            averageDonation: 0,
            todayDonations: 0,
            todayAmount: 0,
            donations: [],
            raffle: {
                prizeAmount: 7000,
                goalAmount: 10000,
                drawingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                isActive: true,
                winner: null
            },
            campaigns: [],
            settings: {
                siteName: 'Donate Ateret',
                contactEmail: 'info@donateateret.com',
                commissionRate: 5,
                thankYouMessage: 'Thank you for your generous donation.',
                defaultPrize: 7000,
                defaultGoal: 10000,
                defaultDuration: 30,
                currency: 'USD',
                emailSender: 'noreply@donateateret.com',
                receiptSubject: 'Donation Receipt',
                theme: 'teal',
                primaryColor: '#14b8a6',
                secondaryColor: '#8b5cf6',
                logoUrl: null,
                faviconUrl: null,
                customCss: null,
                donation_cards: [],
            },
            fundraisers: [],
            isSuperAdmin: false,
            isAdmin: false,
            authorizedAdmins: [],
        };

        return NextResponse.json(stats);
    } catch (error: any) {
        console.error('[AdminAPI] Critical error in GET:', error);
        return NextResponse.json({
            error: 'Failed to fetch admin stats',
            details: error?.message || 'Unknown error'
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    return NextResponse.json({ error: 'Supabase is disabled' }, { status: 503 });
}
