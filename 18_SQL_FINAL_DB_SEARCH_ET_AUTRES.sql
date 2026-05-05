-- =========================================================================
-- PHASE 5 & 6 : DISPONIBILITÉS, FAVORIS, NOTIFICATIONS, PAIEMENTS, RAPPORTS ET RECHERCHE
-- =========================================================================

-- TABLE disponibilité
CREATE TABLE IF NOT EXISTS public.availability_slots (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artisan_id      UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
    slot_date       DATE NOT NULL,
    slot_time       TIME NOT NULL,
    is_booked       BOOLEAN DEFAULT FALSE,
    booking_id      UUID REFERENCES bookings(id),
    UNIQUE(artisan_id, slot_date, slot_time)
);
CREATE INDEX IF NOT EXISTS idx_slots_artisan_date
    ON availability_slots(artisan_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_slots_available
    ON availability_slots(artisan_id, slot_date) WHERE is_booked = FALSE;

-- TABLE favoris
CREATE TABLE IF NOT EXISTS public.favorites (
    client_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
    artisan_id      UUID REFERENCES artisans(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (client_id, artisan_id)
);
CREATE INDEX IF NOT EXISTS idx_favorites_client  ON favorites(client_id);
CREATE INDEX IF NOT EXISTS idx_favorites_artisan ON favorites(artisan_id);

-- TABLE notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    -- Remplace l'ENUM par un TEXT avec CHECK
    type            TEXT NOT NULL CHECK (type IN (
        'booking_request', 'booking_confirmed', 'booking_cancelled',
        'booking_completed', 'new_message', 'new_review',
        'payment_received', 'system'
    )),
    title           TEXT NOT NULL,
    body            TEXT,
    data            JSONB DEFAULT '{}',
    is_read         BOOLEAN DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user
    ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread
    ON notifications(user_id) WHERE is_read = FALSE;

-- TABLE paiements (Stripe)
CREATE TABLE IF NOT EXISTS public.payments (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id                  UUID NOT NULL REFERENCES bookings(id),
    payer_id                    UUID NOT NULL REFERENCES profiles(id),
    stripe_payment_intent_id    TEXT UNIQUE,
    stripe_charge_id            TEXT,
    amount                      DECIMAL(10,2) NOT NULL,
    currency                    TEXT DEFAULT 'DZD',
    status                      TEXT DEFAULT 'pending'
                                CHECK (status IN ('pending','processing','succeeded','failed','refunded')),
    payment_method              TEXT,
    paid_at                     TIMESTAMPTZ,
    refunded_at                 TIMESTAMPTZ,
    refund_reason               TEXT,
    metadata                    JSONB DEFAULT '{}',
    created_at                  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_payer   ON payments(payer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status  ON payments(status);

-- TABLE rapports et signalements
CREATE TABLE IF NOT EXISTS public.reports (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id     UUID NOT NULL REFERENCES profiles(id),
    reported_user   UUID REFERENCES profiles(id),
    reported_review UUID REFERENCES reviews(id),
    reason          TEXT NOT NULL,
    description     TEXT,
    status          TEXT DEFAULT 'pending'
                    CHECK (status IN ('pending','reviewed','resolved','dismissed')),
    admin_notes     TEXT,
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);


-- ═══════════════════════════════════════════════════════════
-- FONCTION RPC : RECHERCHE GÉOLOCALISÉE (search_artisans)
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.search_artisans(
    p_lat           FLOAT DEFAULT NULL,
    p_lng           FLOAT DEFAULT NULL,
    p_radius_km     INTEGER DEFAULT 30,
    p_category_slug TEXT DEFAULT NULL,
    p_min_rating    FLOAT DEFAULT 0,
    p_available     BOOLEAN DEFAULT NULL,
    p_min_price     DECIMAL DEFAULT NULL,
    p_max_price     DECIMAL DEFAULT NULL,
    p_search_text   TEXT DEFAULT NULL,
    p_limit         INTEGER DEFAULT 20,
    p_offset        INTEGER DEFAULT 0
)
RETURNS TABLE (
    artisan_id      UUID,
    profile_id      UUID,
    full_name       TEXT,
    business_name   TEXT,
    avatar_url      TEXT,
    city            TEXT,
    rating_avg      DECIMAL,
    review_count    INTEGER,
    completed_jobs  INTEGER,
    distance_km     FLOAT,
    is_available    BOOLEAN,
    is_certified    BOOLEAN,
    is_premium      BOOLEAN,
    hourly_rate_min DECIMAL,
    hourly_rate_max DECIMAL,
    categories      TEXT[],
    badges          TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id                                            AS artisan_id,
        p.id                                            AS profile_id,
        p.full_name,
        a.business_name,
        p.avatar_url,
        p.city,
        a.rating_avg,
        a.review_count,
        a.completed_jobs,
        (CASE
            WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL AND p.location IS NOT NULL THEN
                ROUND(
                    ST_Distance(
                        p.location,
                        ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
                    ) / 1000, 1
                )::FLOAT
            ELSE NULL
        END)                                            AS distance_km,
        a.is_available,
        a.is_certified,
        a.is_premium,
        a.hourly_rate_min,
        a.hourly_rate_max,
        ARRAY_AGG(DISTINCT c.name)                      AS categories,
        a.badges
    FROM artisans a
    JOIN profiles p ON p.id = a.profile_id
    LEFT JOIN artisan_categories ac ON ac.artisan_id = a.id
    LEFT JOIN categories c ON c.id = ac.category_id
    WHERE
        p.is_active = TRUE
        AND (
            p_lat IS NULL OR p_lng IS NULL OR p.location IS NULL OR
            ST_DWithin(
                p.location,
                ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
                p_radius_km * 1000
            )
        )
        AND (a.rating_avg >= p_min_rating OR a.rating_avg IS NULL)
        AND (p_available IS NULL OR a.is_available = p_available)
        AND (p_category_slug IS NULL OR c.slug = p_category_slug)
        AND (p_min_price IS NULL OR a.hourly_rate_min >= p_min_price)
        AND (p_max_price IS NULL OR a.hourly_rate_max <= p_max_price)
        AND (
            p_search_text IS NULL OR
            p.full_name ILIKE '%' || p_search_text || '%' OR
            a.business_name ILIKE '%' || p_search_text || '%' OR
            a.bio ILIKE '%' || p_search_text || '%'
        )
    GROUP BY a.id, p.id
    ORDER BY
        a.is_premium DESC,
        (CASE WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL AND p.location IS NOT NULL THEN
            ST_Distance(p.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography)
         ELSE 0 END) ASC,
        a.rating_avg DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

