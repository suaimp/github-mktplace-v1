/*
  # Add Coupon Usage Function

  1. Create function to safely increment coupon usage count
  2. Ensure atomic operation to prevent race conditions
*/

-- Function to increment coupon usage count
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE coupons
  SET usage_count = usage_count + 1,
      updated_at = now()
  WHERE id = coupon_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Coupon not found';
  END IF;
END;
$$;
