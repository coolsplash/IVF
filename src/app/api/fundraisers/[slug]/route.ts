import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    console.log('[FundraiserAPI] Fetching slug:', slug);

    try {
        // Return empty data since Supabase is not available
        return NextResponse.json({
            fundraiser: {
                id: '1',
                name: 'Fundraiser',
                slug: slug,
                goal: 10000,
                totalRaised: 0,
                totalDonations: 0,
                donors: []
            },
            globalGoal: 10000
        });
    } catch (error: any) {
        console.error('[FundraiserAPI] Exception:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
