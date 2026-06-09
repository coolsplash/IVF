export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { sendReceiptEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, totalAmount } = body;

        if (!name || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Send summary email
        const emailResult = await sendReceiptEmail({
            toEmail: email,
            donorName: name,
            amount: totalAmount,
        });

        if (!emailResult.success) {
            console.error('Email send failure in complete route:', emailResult.error);
            return NextResponse.json({ error: 'Failed to send receipt email' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Donation receipt email sent successfully',
        });
    } catch (error) {
        console.error('Error in donate complete API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
