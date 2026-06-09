-- Run this SQL in your Supabase SQL Editor

-- 1. Create the 'donations' table
CREATE TABLE IF NOT EXISTS donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  ticket_number TEXT NOT NULL UNIQUE,
  timestamp TIMESTAMPTZ DEFAULT now() NOT NULL,
  stripe_payment_id TEXT,
  note TEXT,
  purpose TEXT
);

-- Note: We disable RLS (Row Level Security) for donations momentarily or use a service key for insert, 
-- but it's best to enable RLS and just allow inserts or public reads tailored to your needs.
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Allow public read access to donations
DROP POLICY IF EXISTS "Public can view donations" ON donations;
CREATE POLICY "Public can view donations"
  ON donations
  FOR SELECT
  USING (true);

-- Allow authenticated admins to delete donations (used when resetting campaigns)
DROP POLICY IF EXISTS "Admins can delete donations" ON donations;
CREATE POLICY "Admins can delete donations"
  ON donations
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert, or we handle insert securely via our Next.js API route 
-- using the Supabase Server Client (which bypasses RLS if we use service_role, but here we use anon key 
-- and API routes can act as a bridge, or we just allow public insert if no real auth on spin).
-- Let's allow public insert for the actual spin so our API route or client can create the donation.
DROP POLICY IF EXISTS "Public can insert donations" ON donations;
CREATE POLICY "Public can insert donations"
  ON donations
  FOR INSERT
  WITH CHECK (true);

-- Add note and purpose columns if they don't exist (for existing tables)
ALTER TABLE donations ADD COLUMN IF NOT EXISTS note TEXT;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS purpose TEXT;

-- 2. Create the 'raffle_state' table (only ever 1 row)
CREATE TABLE IF NOT EXISTS raffle_state (
  id INT PRIMARY KEY DEFAULT 1,
  prize_amount NUMERIC NOT NULL DEFAULT 7000,
  goal_amount NUMERIC NOT NULL DEFAULT 10000,
  campaign_name TEXT NOT NULL DEFAULT 'Main Campaign',
  drawing_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  winner_id UUID REFERENCES donations(id) NULL
);

ALTER TABLE raffle_state ENABLE ROW LEVEL SECURITY;

-- If raffle_state already existed before goal_amount was added, migrate it safely.
ALTER TABLE raffle_state ADD COLUMN IF NOT EXISTS goal_amount NUMERIC NOT NULL DEFAULT 10000;
ALTER TABLE raffle_state ADD COLUMN IF NOT EXISTS campaign_name TEXT NOT NULL DEFAULT 'Main Campaign';

DROP POLICY IF EXISTS "Public can view raffle state" ON raffle_state;
CREATE POLICY "Public can view raffle state"
  ON raffle_state
  FOR SELECT
  USING (true);

-- Only authenticated admins can update raffle state
DROP POLICY IF EXISTS "Admins can update raffle state" ON raffle_state;
CREATE POLICY "Admins can update raffle state"
  ON raffle_state
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Insert the initial raffle row if it doesn't exist
INSERT INTO raffle_state (id, prize_amount, goal_amount, drawing_date, is_active)
VALUES (1, 7000, 10000, now() + interval '30 days', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Create a view for stats (optional, but makes fetching grouped stats easier)
CREATE OR REPLACE VIEW donation_stats AS
SELECT 
  SUM(amount) as total_raised,
  COUNT(*) as total_donations
FROM donations;

-- 4. Create the 'admins' table for dashboard access control
-- Super admin (email hardcoded in policy) can add/remove admins.
CREATE TABLE IF NOT EXISTS admins (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can check if *they* are an admin
DROP POLICY IF EXISTS "Users can read own admin row" ON admins;
CREATE POLICY "Users can read own admin row"
  ON admins
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'email') = email);

-- Super admin can manage the admins list
DROP POLICY IF EXISTS "Super admin can manage admins" ON admins;
CREATE POLICY "Super admin can manage admins"
  ON admins
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'email') = 'admin@donateateret.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'admin@donateateret.com');

-- 4. Archive tables to store donors per completed campaign
CREATE TABLE IF NOT EXISTS campaign_history (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  prize_amount NUMERIC NOT NULL,
  goal_amount NUMERIC NOT NULL,
  drawing_date TIMESTAMPTZ NOT NULL,
  total_raised NUMERIC NOT NULL,
  total_donations INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS campaign_donors (
  id BIGSERIAL PRIMARY KEY,
  campaign_id BIGINT NOT NULL REFERENCES campaign_history(id) ON DELETE CASCADE,
  donation_id UUID,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  ticket_number TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL
);

ALTER TABLE campaign_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_donors ENABLE ROW LEVEL SECURITY;

-- Read-only access to campaign history for dashboards
DROP POLICY IF EXISTS "Public can view campaign history" ON campaign_history;
CREATE POLICY "Public can view campaign history"
  ON campaign_history
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can view campaign donors" ON campaign_donors;
CREATE POLICY "Public can view campaign donors"
  ON campaign_donors
  FOR SELECT
  USING (true);

-- Only authenticated admins can insert archive rows (done from admin API)
DROP POLICY IF EXISTS "Admins can insert campaign history" ON campaign_history;
CREATE POLICY "Admins can insert campaign history"
  ON campaign_history
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can delete campaign history" ON campaign_history;
CREATE POLICY "Admins can delete campaign history"
  ON campaign_history
  FOR DELETE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can insert campaign donors" ON campaign_donors;
CREATE POLICY "Admins can insert campaign donors"
  ON campaign_donors
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can delete campaign donors" ON campaign_donors;
CREATE POLICY "Admins can delete campaign donors"
  ON campaign_donors
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- 5. Settings table for site configuration
CREATE TABLE IF NOT EXISTS site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  site_name TEXT NOT NULL DEFAULT 'Donate Ateret',
  contact_email TEXT NOT NULL DEFAULT 'info@donateateret.com',
  commission_rate NUMERIC NOT NULL DEFAULT 5,
  thank_you_message TEXT NOT NULL DEFAULT 'Thank you for your generous donation to Ateret. Your support makes a real difference.',
  default_prize NUMERIC NOT NULL DEFAULT 7000,
  default_goal NUMERIC NOT NULL DEFAULT 10000,
  default_duration INTEGER NOT NULL DEFAULT 30,
  currency TEXT NOT NULL DEFAULT 'USD',
  email_sender TEXT NOT NULL DEFAULT 'noreply@donateateret.com',
  receipt_subject TEXT NOT NULL DEFAULT 'Donation Receipt - Donate Ateret',
  theme TEXT NOT NULL DEFAULT 'teal',
  primary_color TEXT NOT NULL DEFAULT '#14b8a6',
  secondary_color TEXT NOT NULL DEFAULT '#8b5cf6',
  logo_url TEXT,
  favicon_url TEXT,
  custom_css TEXT,
  stripe_public_key TEXT,
  stripe_secret_key TEXT,
  stripe_test_mode BOOLEAN NOT NULL DEFAULT true,
  minimum_donation NUMERIC NOT NULL DEFAULT 1,
  maximum_donation NUMERIC NOT NULL DEFAULT 100000,
  require_email_verification BOOLEAN NOT NULL DEFAULT true,
  session_timeout INTEGER NOT NULL DEFAULT 24,
  enable_ip_whitelist BOOLEAN NOT NULL DEFAULT false,
  ip_whitelist TEXT,
  terms_url TEXT,
  privacy_url TEXT,
  tax_id TEXT,
  business_address TEXT,
  allow_anonymous BOOLEAN NOT NULL DEFAULT true,
  enable_recurring BOOLEAN NOT NULL DEFAULT false,
  show_donor_names BOOLEAN NOT NULL DEFAULT true,
  enable_social_share BOOLEAN NOT NULL DEFAULT true,
  donation_confirmation TEXT NOT NULL DEFAULT 'email',
  google_analytics_id TEXT,
  facebook_pixel_id TEXT,
  enable_analytics BOOLEAN NOT NULL DEFAULT false,
  custom_tracking_script TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Add new columns if they don't exist (for existing tables)
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS default_prize NUMERIC NOT NULL DEFAULT 7000;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS default_goal NUMERIC NOT NULL DEFAULT 10000;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS default_duration INTEGER NOT NULL DEFAULT 30;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS email_sender TEXT NOT NULL DEFAULT 'noreply@donateateret.com';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS receipt_subject TEXT NOT NULL DEFAULT 'Donation Receipt - Donate Ateret';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'teal';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS primary_color TEXT NOT NULL DEFAULT '#14b8a6';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS secondary_color TEXT NOT NULL DEFAULT '#8b5cf6';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS favicon_url TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS custom_css TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS stripe_public_key TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS stripe_secret_key TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS stripe_test_mode BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS minimum_donation NUMERIC NOT NULL DEFAULT 1;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS maximum_donation NUMERIC NOT NULL DEFAULT 100000;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS require_email_verification BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS session_timeout INTEGER NOT NULL DEFAULT 24;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS enable_ip_whitelist BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS ip_whitelist TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS terms_url TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS privacy_url TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS tax_id TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS business_address TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS allow_anonymous BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS enable_recurring BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS show_donor_names BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS enable_social_share BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS donation_confirmation TEXT NOT NULL DEFAULT 'email';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS google_analytics_id TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS facebook_pixel_id TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS enable_analytics BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS custom_tracking_script TEXT;

-- Public can view settings
DROP POLICY IF EXISTS "Public can view settings" ON site_settings;
CREATE POLICY "Public can view settings"
  ON site_settings
  FOR SELECT
  USING (true);

-- Only authenticated admins can update settings
DROP POLICY IF EXISTS "Admins can update settings" ON site_settings;
CREATE POLICY "Admins can update settings"
  ON site_settings
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Insert default settings row if it doesn't exist
INSERT INTO site_settings (id, site_name, contact_email, commission_rate, thank_you_message, default_prize, default_goal, default_duration, currency, email_sender, receipt_subject, primary_color, secondary_color, stripe_test_mode, minimum_donation, maximum_donation, require_email_verification, session_timeout, enable_ip_whitelist, allow_anonymous, enable_recurring, show_donor_names, enable_social_share, donation_confirmation, enable_analytics)
VALUES (1, 'Donate Ateret', 'info@donateateret.com', 5, 'Thank you for your generous donation to Ateret. Your support makes a real difference.', 7000, 10000, 30, 'USD', 'noreply@donateateret.com', 'Donation Receipt - Donate Ateret', '#14b8a6', '#8b5cf6', true, 1, 100000, true, 24, false, true, false, true, true, 'email', false)
ON CONFLICT (id) DO NOTHING;
