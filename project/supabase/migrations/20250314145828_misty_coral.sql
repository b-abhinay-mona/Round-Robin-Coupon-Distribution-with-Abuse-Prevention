/*
  # Add claims tracking table

  1. New Tables
    - `claims`
      - `id` (uuid, primary key)
      - `coupon_id` (uuid, references coupons.id)
      - `ip_address` (text)
      - `claimed_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `claims` table
    - Add policy for authenticated users to insert claims
    - Add policy for authenticated users to read claims
*/

CREATE TABLE IF NOT EXISTS claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid REFERENCES coupons(id),
  ip_address text NOT NULL,
  claimed_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert claims"
  ON claims
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read claims"
  ON claims
  FOR SELECT
  TO authenticated
  USING (true);

-- Add index for IP address lookups
CREATE INDEX IF NOT EXISTS claims_ip_address_idx ON claims(ip_address);
-- Add index for recent claims lookup
CREATE INDEX IF NOT EXISTS claims_claimed_at_idx ON claims(claimed_at);