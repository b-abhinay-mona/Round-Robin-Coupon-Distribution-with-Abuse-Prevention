/*
  # Add RLS policies for claims table

  1. Security Changes
    - Enable RLS on claims table
    - Add policies for:
      - Anyone can insert claims
      - Authenticated users can read claims
      - No one can update or delete claims (for data integrity)

  This migration ensures proper security while allowing guest users to create claims
  and preventing unauthorized access or modifications.
*/

-- Enable RLS
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert claims (necessary for guest access)
CREATE POLICY "Anyone can insert claims"
ON claims
FOR INSERT
TO public
WITH CHECK (true);

-- Allow authenticated users to read claims (for admin purposes)
CREATE POLICY "Authenticated users can read claims"
ON claims
FOR SELECT
TO authenticated
USING (true);

-- Note: No UPDATE or DELETE policies are created intentionally
-- to maintain data integrity