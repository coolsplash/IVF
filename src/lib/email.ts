export interface SendReceiptEmailParams {
    toEmail: string;
    donorName: string;
    amount: number;
}

export interface SendZelleNotificationParams {
    name: string;
    email: string;
    amount: string;
    note: string;
}

export async function sendReceiptEmail({
    toEmail,
    donorName,
    amount,
}: SendReceiptEmailParams) {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
        console.warn('RESEND_API_KEY is missing. Email skipped.');
        return { success: false, error: 'Resend API key missing' };
    }

    const fromAddress = process.env.RESEND_FROM_EMAIL || 'Donate <donations@itsshabbaton.com>';

    const htmlEmail = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Donation Receipt</title>
        <style>
            body { font-family: sans-serif; background-color: #f0fdfa; color: #134e4a; margin: 0; padding: 40px 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 50px rgba(13, 148, 136, 0.1); }
            .header { background: linear-gradient(135deg, #14b8a6, #0f766e); color: #ffffff; text-align: center; padding: 60px 20px; }
            .content { padding: 50px 40px; }
            .receipt-box { background-color: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 24px; padding: 32px; }
            .footer { text-align: center; padding: 40px; font-size: 14px; color: #0d9488; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header"><h1>Thank You!</h1></div>
            <div class="content">
                <h2>Hi ${donorName},</h2>
                <p>We appreciate your support for the 12th Grade Shabbaton.</p>
                <div class="receipt-box">
                    <strong>Amount:</strong> $${amount.toLocaleString()}<br>
                    <strong>Date:</strong> ${new Date().toLocaleDateString()}
                </div>
            </div>
            <div class="footer">© ${new Date().getFullYear()} 12th Grade Shabbaton</div>
        </div>
    </body>
    </html>
    `;

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: fromAddress,
                to: [toEmail],
                subject: `❤️ Donation Receipt: $${amount}`,
                html: htmlEmail,
            })
        });

        const data: any = await response.json();
        if (!response.ok) throw new Error(data.message || 'Resend API error');

        return { success: true, id: data.id };
    } catch (error: any) {
        console.error('Email error:', error);
        return { success: false, error: error.message };
    }
}

export async function sendZelleNotification({
    name,
    email,
    amount,
    note,
}: SendZelleNotificationParams) {
    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@donateateret.com';

    if (!resendApiKey) {
        console.warn('RESEND_API_KEY is missing. Email skipped.');
        return { success: false, error: 'Resend API key missing' };
    }

    const fromAddress = process.env.RESEND_FROM_EMAIL || 'Donate <donations@itsshabbaton.com>';

    const htmlEmail = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Zelle Donation</title>
        <style>
            body { font-family: sans-serif; background-color: #f0fdfa; color: #134e4a; margin: 0; padding: 40px 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 50px rgba(13, 148, 136, 0.1); }
            .header { background: linear-gradient(135deg, #14b8a6, #0f766e); color: #ffffff; text-align: center; padding: 60px 20px; }
            .content { padding: 50px 40px; }
            .receipt-box { background-color: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 24px; padding: 32px; }
            .footer { text-align: center; padding: 40px; font-size: 14px; color: #0d9488; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header"><h1>💚 New Zelle Donation</h1></div>
            <div class="content">
                <h2>Donation Details</h2>
                <div class="receipt-box">
                    <strong>Name:</strong> ${name}<br>
                    <strong>Email:</strong> ${email}<br>
                    <strong>Amount:</strong> $${amount}<br>
                    <strong>Note:</strong> ${note || 'None'}<br>
                    <strong>Date:</strong> ${new Date().toLocaleString()}
                </div>
                <p style="margin-top: 20px;">Please verify this payment in your Zelle account and record it manually.</p>
            </div>
            <div class="footer">© ${new Date().getFullYear()} Donate Ateret</div>
        </div>
    </body>
    </html>
    `;

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: fromAddress,
                to: [adminEmail],
                subject: `💚 Zelle Donation: $${amount} from ${name}`,
                html: htmlEmail,
            })
        });

        const data: any = await response.json();
        if (!response.ok) throw new Error(data.message || 'Resend API error');

        return { success: true, id: data.id };
    } catch (error: any) {
        console.error('Email error:', error);
        return { success: false, error: error.message };
    }
}
