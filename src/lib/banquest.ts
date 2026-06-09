
export interface BanquestPaymentRequest {
    amount: number;
    payment_token?: string; // One-time use token from client-side tokenization
    cc_number?: string; // Legacy/Direct (only if PCI compliant)
    cc_exp?: string; // MMYY
    cc_cvv?: string;
    first_name: string;
    last_name: string;
    email: string;
    address1?: string;
    city?: string;
    state?: string;
    zip?: string;
}

export interface BanquestResponse {
    status: string; // 'Approved', 'Declined', 'Error'
    status_code: string;
    error_message?: string;
    transaction?: {
        id: number;
        created_at: string;
    };
    last_4?: string;
    auth_code?: string;
}

export class BanquestService {
    private sourceKey: string;
    private pin: string;
    private baseUrl: string;

    constructor() {
        this.sourceKey = process.env.BANQUEST_SOURCE_KEY || '';
        this.pin = process.env.BANQUEST_PIN || '';
        const isSandbox = process.env.BANQUEST_ENV === 'sandbox';
        this.baseUrl = isSandbox
            ? 'https://api.sandbox.banquestgateway.com/v2'
            : 'https://api.banquestgateway.com/v2';

        console.log('[Banquest] Environment Check:');
        console.log('  BANQUEST_SOURCE_KEY exists:', !!process.env.BANQUEST_SOURCE_KEY);
        console.log('  BANQUEST_SOURCE_KEY length:', process.env.BANQUEST_SOURCE_KEY?.length || 0);
        console.log('  BANQUEST_SOURCE_KEY value:', process.env.BANQUEST_SOURCE_KEY?.substring(0, 10) + '...');
        console.log('  BANQUEST_PIN exists:', !!process.env.BANQUEST_PIN);
        console.log('  BANQUEST_PIN length:', process.env.BANQUEST_PIN?.length || 0);
        console.log('  BANQUEST_ENV:', process.env.BANQUEST_ENV);

        if (!this.sourceKey || !this.pin) {
            console.error('[Banquest] BANQUEST_SOURCE_KEY or BANQUEST_PIN is not set in environment variables');
        } else {
            console.log(`[Banquest] Source Key loaded (length: ${this.sourceKey.length})`);
            console.log(`[Banquest] PIN loaded (length: ${this.pin.length})`);
        }
        console.log(`[Banquest] Initialized in ${isSandbox ? 'SANDBOX' : 'PRODUCTION'} mode`);
        console.log(`[Banquest] API URL: ${this.baseUrl}`);
    }

    async processPayment(data: BanquestPaymentRequest): Promise<BanquestResponse> {
        console.log(`[Banquest] Processing payment for ${data.email}, Amount: ${data.amount}`);
        
        if (!this.sourceKey || !this.pin) {
            console.error('[Banquest] Source Key or PIN is missing in processPayment');
            return {
                status: 'Error',
                status_code: '401',
                error_message: 'Payment configuration error: Source Key or PIN missing'
            };
        }

        const payload: any = {
            amount: data.amount,
            billing_info: {
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email
            },
            transaction_details: {
                description: `Donation — ${data.email}`
            },
            transaction_flags: {
                is_customer_initiated: true,
                cardholder_present: false,
                card_present: false,
            },
        };

        // Add optional address fields if provided
        if (data.address1) payload.billing_info.street = data.address1;
        if (data.city) payload.billing_info.city = data.city;
        if (data.state) payload.billing_info.state = data.state;
        if (data.zip) payload.billing_info.zip = data.zip;

        if (data.payment_token) {
            // Use tokenized payment method with nonce- prefix
            payload.source = `nonce-${data.payment_token}`;
        } else if (data.cc_number && data.cc_exp) {
            // Direct card submission (requires PCI compliance)
            payload.card = data.cc_number;
            payload.expiry_month = parseInt(data.cc_exp.substring(0, 2));
            payload.expiry_year = parseInt(data.cc_exp.substring(2, 4)) >= 2000 
                ? parseInt(data.cc_exp.substring(2, 4))
                : 2000 + parseInt(data.cc_exp.substring(2, 4));
            if (data.cc_cvv) {
                payload.cvv2 = data.cc_cvv;
            }
        }

        try {
            console.log(`[Banquest] Calling ${this.baseUrl}/transactions/charge`);
            
            // Build Basic Auth header: base64(SOURCE_KEY:PIN)
            const credentials = Buffer.from(`${this.sourceKey}:${this.pin}`).toString('base64');
            console.log(`[Banquest] Auth header (first 20 chars): Basic ${credentials.substring(0, 20)}...`);
            
            const response = await fetch(`${this.baseUrl}/transactions/charge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${credentials}`,
                    'User-Agent': 'ShabbatonDonations/1.0',
                },
                body: JSON.stringify(payload),
            });

            console.log(`[Banquest] Gateway Status: ${response.status} ${response.statusText}`);
            
            const contentType = response.headers.get('content-type');
            let result;
            
            if (contentType && contentType.includes('application/json')) {
                result = await response.json();
            } else {
                const text = await response.text();
                console.error('[Banquest] Gateway returned non-JSON response:', text);
                return {
                    status: 'Error',
                    status_code: response.status.toString(),
                    error_message: `Gateway error (${response.status}): ${text || 'Unknown Error'}`
                };
            }

            if (!response.ok || result.status !== 'Approved') {
                console.error('[Banquest] API Error Response:', JSON.stringify(result, null, 2));
                return {
                    status: result.status || 'Error',
                    status_code: response.status.toString(),
                    error_message: result.error_message || result.error_details || 'Payment was declined. Please try again.'
                };
            }

            console.log(`[Banquest] Payment Result: ${result.status}`);
            return {
                status: result.status,
                status_code: '200',
                transaction: result.transaction,
                last_4: result.last_4,
                auth_code: result.auth_code,
            };
        } catch (error: any) {
            console.error('[Banquest] Network or Processing Error:', error);
            return {
                status: 'Error',
                status_code: '500',
                error_message: error.message || 'An unexpected error occurred during payment processing'
            };
        }
    }
}

export const banquest = new BanquestService();
