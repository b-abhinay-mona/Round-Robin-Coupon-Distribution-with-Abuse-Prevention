/*
  # Create coupons table

  1. New Tables
    - `coupons`
      - `id` (uuid, primary key)
      - `code` (text, unique)
      - `claimed` (boolean)
      - `claimed_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `coupons` table
    - Add policy for public read access
    - Add policy for authenticated users to update coupons
*/

CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  claimed boolean DEFAULT false,
  claimed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read coupons"
  ON coupons
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update coupons"
  ON coupons
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);