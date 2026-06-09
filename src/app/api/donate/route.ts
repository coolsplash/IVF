import { NextResponse } from 'next/server';
import { banquest } from '@/lib/banquest';
import { sendSms } from '@/lib/sms';
import { sendReceiptEmail } from '@/lib/email';

export const runtime = 'edge';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, amount, sessionId, paymentDetails, paymentToken, fundraiserId, purpose, note } = body;

        if (!name || !email) {
            return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
        }

        if (!paymentToken && (!paymentDetails || !paymentDetails.cc_number || !paymentDetails.cc_exp || !paymentDetails.cc_cvv)) {
            return NextResponse.json({ error: 'Payment details or token are required' }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        const numAmount = Number(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        // Process Banquest payment
        const nameParts = name.trim().split(' ');
        const first_name = nameParts[0];
        const last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Donor';

        console.log(`[API Donate] Attempting payment for ${email}, amount: ${numAmount}`);
        const banquestResponse = await banquest.processPayment({
            amount: numAmount,
            payment_token: paymentToken,
            cc_number: paymentDetails?.cc_number,
            cc_exp: paymentDetails?.cc_exp,
            cc_cvv: paymentDetails?.cc_cvv,
            first_name,
            last_name,
            email,
        });

        if (banquestResponse.status !== 'Approved') {
            console.error(`[API Donate] Payment Failed: ${banquestResponse.error_message || 'Declined'}`);
            return NextResponse.json({ 
                error: banquestResponse.error_message || 'Payment declined' 
            }, { status: 400 });
        }

        const transactionId = banquestResponse.transaction?.id?.toString() || `ref_${crypto.randomUUID().slice(0, 8)}`;
        console.log(`[API Donate] Payment Approved: ${transactionId}`);

        // Send Notifications (SMS & Email)
        try {
            // Send SMS to admin
            await sendSms({
                to: '16463162601',
                message: `Update: New donation:\n${name}\n$${numAmount}`,
            });

            // Send Thank You Email to Donor
            await sendReceiptEmail({
                toEmail: email,
                donorName: name,
                amount: numAmount
            });
        } catch (notificationError) {
            console.error('[API Donate] Notification failed:', notificationError);
            // Don't fail the donation if notifications fail
        }

        return NextResponse.json({
            success: true,
            amount: numAmount,
            message: `Thank you ${name}! Your donation of $${numAmount} was successful.`,
        });
    } catch (error: any) {
        console.error('[API Donate] Global Catch Error:', {
            message: error.message,
            stack: error.stack,
            cause: error.cause
        });
        return NextResponse.json({ 
            error: error.message || 'Failed to process donation',
            debug: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        }, { status: 500 });
    }
}
