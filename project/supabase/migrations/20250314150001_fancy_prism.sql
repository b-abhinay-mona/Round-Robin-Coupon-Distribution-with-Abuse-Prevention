/*
  # Add test coupons

  1. Changes
    - Add 10 test coupons with unique codes
    - All coupons are initially unclaimed
*/

INSERT INTO coupons (code, claimed)
VALUES 
  ('SPRING25', false),
  ('SUMMER50', false),
  ('FALL30', false),
  ('WINTER40', false),
  ('HAPPY10', false),
  ('SAVE20', false),
  ('EXTRA15', false),
  ('BONUS25', false),
  ('SPECIAL35', false),
  ('DEAL45', false)
ON CONFLICT (code) DO NOTHING;