-- =============================================================================
-- PATCH 39 : Metadonnees des commandes de paiement + normalisation des forfaits
-- =============================================================================

BEGIN;

ALTER TABLE public.payment_orders
ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.artisans
DROP CONSTRAINT IF EXISTS artisans_subscription_tier_check;

ALTER TABLE public.artisans
ADD CONSTRAINT artisans_subscription_tier_check
CHECK (subscription_tier IN ('basic', 'starter', 'pro', 'free', 'premium', 'vip'));

ALTER TABLE public.artisans
ALTER COLUMN subscription_tier SET DEFAULT 'basic';

COMMIT;
