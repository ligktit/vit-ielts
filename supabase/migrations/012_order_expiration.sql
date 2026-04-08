-- ============================================================================
-- Migration: 012_order_expiration.sql
-- Description: Order expiration system for abandoned payments
--   1. decrement_coupon_uses RPC — atomically rollback coupon slot
--   2. expire_stale_orders() — marks old pending orders as 'expired'
--      and rolls back coupon usage
--   3. pg_cron schedule — runs every 5 minutes
--
-- ⚠️ PREREQUISITE: Enable pg_cron extension in Supabase Dashboard
--    → Database → Extensions → search "pg_cron" → Enable
-- ============================================================================

-- ============================================================================
-- 1. ATOMIC COUPON DECREMENT
-- Safely decrements current_uses. Does NOT go below 0.
-- Returns the updated coupon row, or NULL if coupon doesn't exist.
-- ============================================================================
CREATE OR REPLACE FUNCTION decrement_coupon_uses(p_coupon_id UUID)
RETURNS TABLE(
  id UUID,
  code TEXT,
  current_uses INTEGER,
  max_uses INTEGER,
  is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  UPDATE coupons
  SET current_uses = GREATEST(0, coupons.current_uses - 1)
  WHERE coupons.id = p_coupon_id
    AND coupons.current_uses > 0
  RETURNING
    coupons.id,
    coupons.code,
    coupons.current_uses,
    coupons.max_uses,
    coupons.is_active;
END;
$$;


-- ============================================================================
-- 2. EXPIRE STALE ORDERS
-- Marks pending orders older than p_ttl_minutes as 'expired'.
-- Rolls back coupon usage for orders that had a coupon applied.
-- Returns the number of expired orders.
--
-- Default TTL: 60 minutes
-- ============================================================================
CREATE OR REPLACE FUNCTION expire_stale_orders(p_ttl_minutes INTEGER DEFAULT 60)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expired_count INTEGER;
  v_coupon_record RECORD;
BEGIN
  -- Step 1: Rollback coupon usage for stale orders that have a coupon_id
  FOR v_coupon_record IN
    SELECT o.coupon_id
    FROM orders o
    WHERE o.status = 'pending'
      AND o.created_at < now() - (p_ttl_minutes || ' minutes')::INTERVAL
      AND o.coupon_id IS NOT NULL
  LOOP
    PERFORM decrement_coupon_uses(v_coupon_record.coupon_id);
  END LOOP;

  -- Step 2: Bulk update all stale pending orders to 'expired'
  WITH expired AS (
    UPDATE orders
    SET status = 'expired'
    WHERE status = 'pending'
      AND created_at < now() - (p_ttl_minutes || ' minutes')::INTERVAL
    RETURNING id
  )
  SELECT count(*) INTO v_expired_count FROM expired;

  RETURN v_expired_count;
END;
$$;


-- ============================================================================
-- 3. SCHEDULE: Run expire_stale_orders every 5 minutes via pg_cron
-- ============================================================================
SELECT cron.schedule(
  'expire-stale-orders',
  '*/5 * * * *',
  $$SELECT expire_stale_orders(60)$$
);
