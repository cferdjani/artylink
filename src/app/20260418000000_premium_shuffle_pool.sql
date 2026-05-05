-- 1. Séquence pour le curseur atomique global
CREATE SEQUENCE IF NOT EXISTS global_ticker_cursor START 1;

-- 2. Table Pool (Cache dénormalisé pour lecture instantanée)
CREATE TABLE IF NOT EXISTS premium_shuffle_pool (
    shuffle_index INT PRIMARY KEY,
    artisan_id UUID NOT NULL,
    name TEXT,
    profession TEXT,
    avatar_url TEXT,
    rating DECIMAL(3,2),
    type TEXT DEFAULT 'artisan'
);

CREATE INDEX IF NOT EXISTS idx_shuffle_pool_index ON premium_shuffle_pool(shuffle_index);

-- 3. Fonction de Rafraîchissement (A exécuter manuellement ou par pg_cron)
CREATE OR REPLACE FUNCTION refresh_premium_pool() 
RETURNS void AS $$
BEGIN
    TRUNCATE premium_shuffle_pool;
    
    INSERT INTO premium_shuffle_pool (shuffle_index, artisan_id, name, profession, avatar_url, rating, type)
    SELECT 
        row_number() OVER (ORDER BY random()) as shuffle_index,
        p.id as artisan_id,
        COALESCE(a.company_name, p.full_name) as name,
        a.wilaya as profession,
        p.avatar_url,
        a.rating as rating,
        'artisan' as type
    FROM profiles p
    JOIN artisans a ON p.id = a.id
    WHERE a.subscription_tier = 'pro';

    ALTER SEQUENCE global_ticker_cursor RESTART WITH 1;
END;
$$ LANGUAGE plpgsql;

-- 4. Fonction RPC de Lecture (Le Ticker)
CREATE OR REPLACE FUNCTION get_next_premium_batch(batch_size INT DEFAULT 10) 
RETURNS SETOF premium_shuffle_pool AS $$
DECLARE
    current_idx INT;
    total_count INT;
BEGIN
    SELECT count(*)::INT INTO total_count FROM premium_shuffle_pool;
    IF total_count = 0 THEN RETURN; END IF;

    SELECT nextval('global_ticker_cursor')::INT INTO current_idx;
    current_idx := ((current_idx - 1) * batch_size) % total_count;

    RETURN QUERY 
    SELECT * FROM premium_shuffle_pool 
    ORDER BY shuffle_index ASC
    OFFSET current_idx
    LIMIT batch_size;
END;
$$ LANGUAGE plpgsql;