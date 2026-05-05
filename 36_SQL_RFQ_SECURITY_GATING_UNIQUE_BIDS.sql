-- Migration: Sécuriser la table rfq_bids en empêchant les soumissions en double par un même artisan

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'unique_artisan_bid_per_rfq'
    ) THEN
        ALTER TABLE public.rfq_bids
        ADD CONSTRAINT unique_artisan_bid_per_rfq UNIQUE (rfq_id, artisan_id);
    END IF;
END $$;
