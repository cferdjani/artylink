-- =========================================================================
-- SPRINT 3 : PAIEMENT LOCAL ALGERIE (CCP, BARIDIMOB), WALLETS & PROMOS
-- =========================================================================

-- 1. WALLET LEDGER
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_dzd NUMERIC(10,2) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit','debit')),
  reference_type TEXT NOT NULL CHECK (reference_type IN ('payment_proof','promo_code','referral','manual_admin','service_purchase')),
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PAYMENT ORDERS
CREATE TABLE IF NOT EXISTS public.payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_dzd NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment','under_review','completed','rejected')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PAYMENT PROOFS
CREATE TABLE IF NOT EXISTS public.payment_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.payment_orders(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('baridimob','ccp','cash')),
  proof_url TEXT NOT NULL,
  transaction_reference TEXT,
  status TEXT NOT NULL DEFAULT 'under_review' CHECK (status IN ('under_review','approved','rejected')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  admin_notes TEXT,
  UNIQUE (order_id)
);

-- 4. PROMO CODES
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_amount_dzd NUMERIC(10,2) NOT NULL,
  max_usages INTEGER NOT NULL DEFAULT 1,
  current_usages INTEGER NOT NULL DEFAULT 0,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. REFERRAL CODES
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  reward_amount_dzd NUMERIC(10,2) NOT NULL DEFAULT 500.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_user ON public.payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON public.payment_orders(status);

-- RLS
ALTER TABLE IF EXISTS public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Wallet
DROP POLICY IF EXISTS "Users can view own wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Users can view own wallet transactions" ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id);

-- Orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.payment_orders;
CREATE POLICY "Users can view own orders" ON public.payment_orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own orders" ON public.payment_orders;
CREATE POLICY "Users can insert own orders" ON public.payment_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Proofs
DROP POLICY IF EXISTS "Users can view own payment proofs" ON public.payment_proofs;
CREATE POLICY "Users can view own payment proofs" ON public.payment_proofs FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM public.payment_orders po
    WHERE po.id = payment_proofs.order_id AND po.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert own payment proofs" ON public.payment_proofs;
CREATE POLICY "Users can insert own payment proofs" ON public.payment_proofs FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.payment_orders po
    WHERE po.id = order_id AND po.user_id = auth.uid()
  )
);

-- Promo codes
DROP POLICY IF EXISTS "Public can view promo codes" ON public.promo_codes;
CREATE POLICY "Public can view promo codes" ON public.promo_codes FOR SELECT USING (true);

-- Referral codes
DROP POLICY IF EXISTS "Authenticated can view referral codes" ON public.referral_codes;
CREATE POLICY "Authenticated can view referral codes" ON public.referral_codes FOR SELECT USING (auth.role() = 'authenticated');
