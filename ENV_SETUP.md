# Environment Variables Setup

This application uses Banquest as the payment gateway. You need to configure the following environment variables:

## Required Environment Variables

### Banquest Payment Gateway

```bash
# Banquest Source Key (required)
# Get this from your Banquest Control Panel > Source Management > Create Key
# This is a public key that starts with "pk_"
BANQUEST_SOURCE_KEY=your_source_key_here

# Banquest PIN (required)
# This is the PIN associated with your source key
BANQUEST_PIN=your_pin_here

# Banquest Environment (required)
# Set to 'sandbox' for testing, 'production' for live payments
BANQUEST_ENV=sandbox
```

### Supabase (Database)

```bash
# Supabase URL and Anon Key (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Venmo Payments

```bash
# Your Venmo Username (required)
# This is the Venmo username that will receive payments
# Users will be directed to send money to this Venmo account
NEXT_PUBLIC_VENMO_USERNAME=your-venmo-username
```

## Getting Your Venmo Username

1. Open the Venmo app on your phone
2. Go to your profile
3. Your Venmo username is displayed at the top of your profile (starts with @)
4. Add it to your environment variables without the @ symbol

**Note**: The Venmo button uses a deep link to open the Venmo app directly on mobile devices. On desktop, it will redirect to the Venmo website.

## Getting Your Banquest Source Key and PIN

1. Log in to your Banquest Control Panel
2. Navigate to **Source Management** > **Create Key**
3. Create a new source key (this is your public key, starts with "pk_")
4. Set a PIN for the source key
5. Copy both the Source Key and PIN and add them to your environment variables

## Sandbox vs Production

- **Sandbox**: Use `BANQUEST_ENV=sandbox` for testing. This uses test cards and doesn't process real payments.
  - Sandbox API: `https://api.sandbox.banquestgateway.com/v2`
  
- **Production**: Use `BANQUEST_ENV=production` for live payments.
  - Production API: `https://api.banquestgateway.com/v2`

## Test Cards for Sandbox

When using sandbox mode, you can test with these card numbers:
- Visa: 4111111111111111
- Mastercard: 5424180279791732
- Amex: 371449635398431

Use any future expiry date and any 3-4 digit CVV.

## Security Notes

⚠️ **Important**: Never commit your `.env` file to version control. The `.gitignore` file is configured to ignore `.env*` files.

For production deployment, set these environment variables in your hosting platform's configuration (Vercel, Netlify, etc.).
