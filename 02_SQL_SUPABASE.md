# 🗄️ Schéma SQL Complet — Supabase / PostgreSQL 15

> Exécuter chaque bloc dans l'ordre dans l'éditeur SQL de Supabase  
> Dashboard → SQL Editor → New Query → Coller → Run

---

## ÉTAPE 0 — Extensions PostgreSQL

```sql
-- Activer les extensions nécessaires (exécuter en premier)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
```

---

## ÉTAPE 1 — Fonction utilitaire `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## ÉTAPE 2 — TABLE `profiles`

```sql
CREATE TABLE public.profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email           TEXT UNIQUE NOT NULL,
    full_name       TEXT NOT NULL,
    avatar_url      TEXT,
    phone           TEXT,
    role            TEXT NOT NULL DEFAULT 'client'
                    CHECK (role IN ('client', 'artisan', 'admin')),
    is_verified     BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    address_line    TEXT,
    city            TEXT,
    postal_code     TEXT,
    country         TEXT DEFAULT 'France',
    location        GEOGRAPHY(POINT, 4326),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index géospatial
CREATE INDEX idx_profiles_location
    ON profiles USING GIST(location);

-- Index full-text nom
CREATE INDEX idx_profiles_fullname_trgm
    ON profiles USING GIN(full_name gin_trgm_ops);

-- Index rôle
CREATE INDEX idx_profiles_role ON profiles(role);

-- Trigger updated_at
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## ÉTAPE 3 — TABLE `categories`

```sql
CREATE TABLE public.categories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL UNIQUE,
    slug            TEXT NOT NULL UNIQUE,
    description     TEXT,
    icon_name       TEXT,
    color_hex       TEXT DEFAULT '#FF6B35',
    parent_id       UUID REFERENCES categories(id),
    is_active       BOOLEAN DEFAULT TRUE,
    sort_order      INTEGER DEFAULT 0,
    artisan_count   INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Données initiales
INSERT INTO categories (name, slug, icon_name, color_hex, sort_order) VALUES
    ('Plomberie',     'plomberie',     'plumbing',           '#2196F3', 1),
    ('Électricité',   'electricite',   'electrical_services','#FF9800', 2),
    ('Maçonnerie',    'maconnerie',    'foundation',         '#795548', 3),
    ('Peinture',      'peinture',      'format_paint',       '#E91E63', 4),
    ('Menuiserie',    'menuiserie',    'carpenter',          '#8D6E63', 5),
    ('Jardinage',     'jardinage',     'yard',               '#4CAF50', 6),
    ('Nettoyage',     'nettoyage',     'cleaning_services',  '#00BCD4', 7),
    ('Déménagement',  'demenagement',  'local_shipping',     '#9C27B0', 8),
    ('Climatisation', 'climatisation', 'ac_unit',            '#03A9F4', 9),
    ('Carrelage',     'carrelage',     'grid_on',            '#FF5722', 10),
    ('Serrurerie',    'serrurerie',    'lock',               '#607D8B', 11),
    ('Toiture',       'toiture',       'roofing',            '#F44336', 12),
    ('Vitrier',       'vitrier',       'window',             '#00BCD4', 13),
    ('Informatique',  'informatique',  'computer',           '#3F51B5', 14),
    ('Débarras',      'debarras',      'delete_sweep',       '#9E9E9E', 15);
```

---

## ÉTAPE 4 — TABLE `artisans`

```sql
CREATE TABLE public.artisans (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id           UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,

    -- Informations professionnelles
    business_name        TEXT,
    siret                TEXT UNIQUE,
    insurance_number     TEXT,
    years_experience     INTEGER DEFAULT 0,
    bio                  TEXT,

    -- Zone d'intervention
    intervention_radius  INTEGER DEFAULT 30,        -- Rayon km

    -- Statistiques (calculées automatiquement par triggers)
    rating_avg           DECIMAL(3,2) DEFAULT 0.00
                         CHECK (rating_avg BETWEEN 0 AND 5),
    review_count         INTEGER DEFAULT 0,
    completed_jobs       INTEGER DEFAULT 0,
    response_rate        DECIMAL(5,2) DEFAULT 0.00,
    response_time_hours  INTEGER DEFAULT 24,
    profile_views        INTEGER DEFAULT 0,

    -- Disponibilité
    is_available         BOOLEAN DEFAULT TRUE,
    available_from       TIME DEFAULT '08:00',
    available_to         TIME DEFAULT '18:00',
    works_weekend        BOOLEAN DEFAULT FALSE,

    -- Certifications & Badges
    is_certified         BOOLEAN DEFAULT FALSE,
    is_premium           BOOLEAN DEFAULT FALSE,
    badges               TEXT[] DEFAULT '{}',       -- ['RGE','Qualibat','QualiPAC']

    -- Tarification
    hourly_rate_min      DECIMAL(10,2),
    hourly_rate_max      DECIMAL(10,2),

    -- Moyens de paiement acceptés
    accepts_card         BOOLEAN DEFAULT TRUE,
    accepts_check        BOOLEAN DEFAULT TRUE,
    accepts_cash         BOOLEAN DEFAULT TRUE,

    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_artisans_rating    ON artisans(rating_avg DESC);
CREATE INDEX idx_artisans_available ON artisans(is_available) WHERE is_available = TRUE;
CREATE INDEX idx_artisans_profile   ON artisans(profile_id);
CREATE INDEX idx_artisans_premium   ON artisans(is_premium) WHERE is_premium = TRUE;

CREATE TRIGGER set_artisans_updated_at
    BEFORE UPDATE ON artisans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## ÉTAPE 5 — TABLE `artisan_categories` (Many-to-Many)

```sql
CREATE TABLE public.artisan_categories (
    artisan_id      UUID REFERENCES artisans(id) ON DELETE CASCADE,
    category_id     UUID REFERENCES categories(id) ON DELETE CASCADE,
    is_primary      BOOLEAN DEFAULT FALSE,
    sub_skills      TEXT[] DEFAULT '{}',
    PRIMARY KEY (artisan_id, category_id)
);

CREATE INDEX idx_artisan_categories_cat ON artisan_categories(category_id);
CREATE INDEX idx_artisan_categories_art ON artisan_categories(artisan_id);
```

---

## ÉTAPE 6 — TABLE `services`

```sql
CREATE TABLE public.services (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artisan_id      UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
    category_id     UUID REFERENCES categories(id),
    name            TEXT NOT NULL,
    description     TEXT,
    pricing_type    TEXT DEFAULT 'hourly'
                    CHECK (pricing_type IN ('hourly', 'fixed', 'quote', 'per_unit')),
    price           DECIMAL(10,2),
    price_unit      TEXT,                           -- 'heure', 'm²', 'pièce', 'forfait'
    min_duration    INTEGER,                        -- Minutes
    max_duration    INTEGER,
    is_active       BOOLEAN DEFAULT TRUE,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_artisan ON services(artisan_id);
CREATE INDEX idx_services_active  ON services(artisan_id) WHERE is_active = TRUE;
```

---

## ÉTAPE 7 — TABLE `portfolio_items`

```sql
CREATE TABLE public.portfolio_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artisan_id      UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
    category_id     UUID REFERENCES categories(id),
    title           TEXT NOT NULL,
    description     TEXT,
    image_url       TEXT NOT NULL,
    before_url      TEXT,
    after_url       TEXT,
    work_date       DATE,
    location_city   TEXT,
    is_featured     BOOLEAN DEFAULT FALSE,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_portfolio_artisan  ON portfolio_items(artisan_id);
CREATE INDEX idx_portfolio_featured ON portfolio_items(artisan_id) WHERE is_featured = TRUE;
```

---

## ÉTAPE 8 — TABLE `bookings`

```sql
-- Types ENUM
CREATE TYPE booking_status AS ENUM (
    'pending',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'disputed'
);

CREATE TYPE payment_status AS ENUM (
    'unpaid',
    'pending',
    'paid',
    'refunded',
    'failed'
);

CREATE TABLE public.bookings (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_ref         TEXT UNIQUE DEFAULT
                        'BK-' || UPPER(substring(gen_random_uuid()::text, 1, 8)),

    -- Parties impliquées
    client_id           UUID NOT NULL REFERENCES profiles(id),
    artisan_id          UUID NOT NULL REFERENCES artisans(id),
    service_id          UUID REFERENCES services(id),

    -- Planification
    scheduled_date      DATE NOT NULL,
    scheduled_time      TIME NOT NULL,
    estimated_duration  INTEGER,                    -- Minutes

    -- Adresse d'intervention
    address_line        TEXT NOT NULL,
    city                TEXT NOT NULL,
    postal_code         TEXT NOT NULL,
    location            GEOGRAPHY(POINT, 4326),

    -- Description du travail
    description         TEXT,
    notes               TEXT,
    photos_before       TEXT[] DEFAULT '{}',
    photos_after        TEXT[] DEFAULT '{}',

    -- Statut
    status              booking_status DEFAULT 'pending',
    payment_status      payment_status DEFAULT 'unpaid',

    -- Financier
    price_estimate      DECIMAL(10,2),
    price_final         DECIMAL(10,2),
    commission_rate     DECIMAL(5,2) DEFAULT 5.00,
    commission_amount   DECIMAL(10,2)
                        GENERATED ALWAYS AS (price_final * commission_rate / 100) STORED,

    -- Timestamps de statut
    confirmed_at        TIMESTAMPTZ,
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    cancelled_at        TIMESTAMPTZ,
    cancelled_by        UUID REFERENCES profiles(id),
    cancel_reason       TEXT,

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_client    ON bookings(client_id, created_at DESC);
CREATE INDEX idx_bookings_artisan   ON bookings(artisan_id, scheduled_date);
CREATE INDEX idx_bookings_status    ON bookings(status);
CREATE INDEX idx_bookings_date      ON bookings(scheduled_date);
CREATE INDEX idx_bookings_ref       ON bookings(booking_ref);
CREATE INDEX idx_bookings_location  ON bookings USING GIST(location);

CREATE TRIGGER set_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## ÉTAPE 9 — TABLE `reviews`

```sql
CREATE TABLE public.reviews (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id          UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    client_id           UUID NOT NULL REFERENCES profiles(id),
    artisan_id          UUID NOT NULL REFERENCES artisans(id),

    -- Notes détaillées (1-5)
    rating_overall      INTEGER NOT NULL CHECK (rating_overall BETWEEN 1 AND 5),
    rating_quality      INTEGER CHECK (rating_quality BETWEEN 1 AND 5),
    rating_punctuality  INTEGER CHECK (rating_punctuality BETWEEN 1 AND 5),
    rating_price        INTEGER CHECK (rating_price BETWEEN 1 AND 5),
    rating_cleanliness  INTEGER CHECK (rating_cleanliness BETWEEN 1 AND 5),

    comment             TEXT,
    artisan_reply       TEXT,
    artisan_replied_at  TIMESTAMPTZ,
    is_verified         BOOLEAN DEFAULT TRUE,
    is_visible          BOOLEAN DEFAULT TRUE,
    helpful_count       INTEGER DEFAULT 0,

    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_artisan ON reviews(artisan_id, created_at DESC);
CREATE INDEX idx_reviews_client  ON reviews(client_id);
CREATE INDEX idx_reviews_visible ON reviews(artisan_id) WHERE is_visible = TRUE;
```

---

## ÉTAPE 10 — TABLE `messages`

```sql
CREATE TABLE public.messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id      UUID REFERENCES bookings(id) ON DELETE CASCADE,
    sender_id       UUID NOT NULL REFERENCES profiles(id),
    receiver_id     UUID NOT NULL REFERENCES profiles(id),
    content         TEXT NOT NULL,
    attachments     TEXT[] DEFAULT '{}',
    is_read         BOOLEAN DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_booking  ON messages(booking_id, created_at ASC);
CREATE INDEX idx_messages_receiver ON messages(receiver_id, is_read);
CREATE INDEX idx_messages_unread   ON messages(receiver_id) WHERE is_read = FALSE;

-- Activer Realtime sur messages
ALTER TABLE messages REPLICA IDENTITY FULL;
```

---

## ÉTAPE 11 — TABLE `availability_slots`

```sql
CREATE TABLE public.availability_slots (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artisan_id      UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
    slot_date       DATE NOT NULL,
    slot_time       TIME NOT NULL,
    is_booked       BOOLEAN DEFAULT FALSE,
    booking_id      UUID REFERENCES bookings(id),
    UNIQUE(artisan_id, slot_date, slot_time)
);

CREATE INDEX idx_slots_artisan_date
    ON availability_slots(artisan_id, slot_date);
CREATE INDEX idx_slots_available
    ON availability_slots(artisan_id, slot_date) WHERE is_booked = FALSE;
```

---

## ÉTAPE 12 — TABLE `favorites`

```sql
CREATE TABLE public.favorites (
    client_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
    artisan_id      UUID REFERENCES artisans(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (client_id, artisan_id)
);

CREATE INDEX idx_favorites_client  ON favorites(client_id);
CREATE INDEX idx_favorites_artisan ON favorites(artisan_id);
```

---

## ÉTAPE 13 — TABLE `notifications`

```sql
CREATE TYPE notification_type AS ENUM (
    'booking_request',
    'booking_confirmed',
    'booking_cancelled',
    'booking_completed',
    'new_message',
    'new_review',
    'payment_received',
    'system'
);

CREATE TABLE public.notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type            notification_type NOT NULL,
    title           TEXT NOT NULL,
    body            TEXT,
    data            JSONB DEFAULT '{}',
    is_read         BOOLEAN DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user
    ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_unread
    ON notifications(user_id) WHERE is_read = FALSE;

-- Activer Realtime sur notifications
ALTER TABLE notifications REPLICA IDENTITY FULL;
```

---

## ÉTAPE 14 — TABLE `payments`

```sql
CREATE TABLE public.payments (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id                  UUID NOT NULL REFERENCES bookings(id),
    payer_id                    UUID NOT NULL REFERENCES profiles(id),

    -- Stripe
    stripe_payment_intent_id    TEXT UNIQUE,
    stripe_charge_id            TEXT,

    amount                      DECIMAL(10,2) NOT NULL,
    currency                    TEXT DEFAULT 'EUR',
    status                      TEXT DEFAULT 'pending'
                                CHECK (status IN ('pending','processing','succeeded','failed','refunded')),
    payment_method              TEXT,
    paid_at                     TIMESTAMPTZ,
    refunded_at                 TIMESTAMPTZ,
    refund_reason               TEXT,
    metadata                    JSONB DEFAULT '{}',
    created_at                  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_payer   ON payments(payer_id);
CREATE INDEX idx_payments_status  ON payments(status);
```

---

## ÉTAPE 15 — TABLE `reports`

```sql
CREATE TABLE public.reports (
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

CREATE INDEX idx_reports_status ON reports(status);
```

---

## ÉTAPE 16 — TRIGGERS MÉTIER

```sql
-- ═══════════════════════════════════════════════════════════
-- TRIGGER 1 : Création automatique du profil après inscription
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'client')
    );

    -- Si artisan, créer aussi l'entrée artisans
    IF COALESCE(NEW.raw_user_meta_data->>'role', 'client') = 'artisan' THEN
        INSERT INTO public.artisans (profile_id)
        VALUES (NEW.id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ═══════════════════════════════════════════════════════════
-- TRIGGER 2 : Mise à jour automatique de la note artisan
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_artisan_rating()
RETURNS TRIGGER AS $$
DECLARE
    v_artisan_id UUID;
BEGIN
    v_artisan_id := COALESCE(NEW.artisan_id, OLD.artisan_id);

    UPDATE artisans
    SET
        rating_avg = (
            SELECT COALESCE(ROUND(AVG(rating_overall)::numeric, 2), 0.00)
            FROM reviews
            WHERE artisan_id = v_artisan_id
            AND is_visible = TRUE
        ),
        review_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE artisan_id = v_artisan_id
            AND is_visible = TRUE
        ),
        updated_at = NOW()
    WHERE id = v_artisan_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_artisan_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_artisan_rating();


-- ═══════════════════════════════════════════════════════════
-- TRIGGER 3 : Compteur jobs terminés
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_artisan_completed_jobs()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE artisans
        SET
            completed_jobs = completed_jobs + 1,
            updated_at = NOW()
        WHERE id = NEW.artisan_id;

        -- Mettre à jour timestamp booking
        UPDATE bookings
        SET completed_at = NOW()
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_completed_jobs
    AFTER UPDATE OF status ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_artisan_completed_jobs();


-- ═══════════════════════════════════════════════════════════
-- TRIGGER 4 : Compteur artisans par catégorie
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_category_artisan_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE categories
        SET artisan_count = artisan_count + 1
        WHERE id = NEW.category_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE categories
        SET artisan_count = GREATEST(artisan_count - 1, 0)
        WHERE id = OLD.category_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_category_count
    AFTER INSERT OR DELETE ON artisan_categories
    FOR EACH ROW EXECUTE FUNCTION update_category_artisan_count();


-- ═══════════════════════════════════════════════════════════
-- TRIGGER 5 : Marquer créneau comme réservé
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_availability_on_booking()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
        UPDATE availability_slots
        SET is_booked = TRUE, booking_id = NEW.id
        WHERE artisan_id = NEW.artisan_id
          AND slot_date = NEW.scheduled_date
          AND slot_time = NEW.scheduled_time;
    ELSIF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        UPDATE availability_slots
        SET is_booked = FALSE, booking_id = NULL
        WHERE booking_id = NEW.id;

        UPDATE bookings
        SET cancelled_at = NOW()
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_availability_booking
    AFTER UPDATE OF status ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_availability_on_booking();
```

---

## ÉTAPE 17 — FONCTION DE RECHERCHE GÉOLOCALISÉE

```sql
CREATE OR REPLACE FUNCTION search_artisans(
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
        CASE
            WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL THEN
                ROUND(
                    ST_Distance(
                        p.location,
                        ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
                    ) / 1000, 1
                )::FLOAT
            ELSE NULL
        END                                             AS distance_km,
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
            p_lat IS NULL OR p_lng IS NULL OR
            ST_DWithin(
                p.location,
                ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
                p_radius_km * 1000
            )
        )
        AND a.rating_avg >= p_min_rating
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
        (CASE WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL THEN
            ST_Distance(p.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography)
         ELSE 0 END) ASC,
        a.rating_avg DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
```

---

## ÉTAPE 18 — VUES SQL

```sql
-- ═══════════════════════════════════════════════════════════
-- VUE : Profil artisan complet (dashboard + page publique)
-- ═══════════════════════════════════════════════════════════
CREATE VIEW artisan_full_profile AS
SELECT
    a.id                AS artisan_id,
    p.id                AS profile_id,
    p.full_name,
    p.email,
    p.phone,
    p.avatar_url,
    p.city,
    p.postal_code,
    p.location,
    a.business_name,
    a.siret,
    a.bio,
    a.years_experience,
    a.intervention_radius,
    a.rating_avg,
    a.review_count,
    a.completed_jobs,
    a.response_rate,
    a.response_time_hours,
    a.is_available,
    a.available_from,
    a.available_to,
    a.works_weekend,
    a.is_certified,
    a.is_premium,
    a.badges,
    a.hourly_rate_min,
    a.hourly_rate_max,
    a.accepts_card,
    a.accepts_check,
    a.accepts_cash,
    a.profile_views,
    a.created_at        AS member_since
FROM artisans a
JOIN profiles p ON p.id = a.profile_id
WHERE p.is_active = TRUE;

-- ═══════════════════════════════════════════════════════════
-- VUE : Statistiques Admin
-- ═══════════════════════════════════════════════════════════
CREATE VIEW admin_dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM profiles WHERE role = 'client')        AS total_clients,
    (SELECT COUNT(*) FROM profiles WHERE role = 'artisan')       AS total_artisans,
    (SELECT COUNT(*) FROM artisans WHERE is_verified = TRUE)     AS verified_artisans,
    (SELECT COUNT(*) FROM bookings)                              AS total_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'completed')   AS completed_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'pending')     AS pending_bookings,
    (SELECT COALESCE(SUM(price_final),0)
     FROM bookings WHERE status = 'completed')                   AS total_revenue,
    (SELECT COALESCE(SUM(commission_amount),0)
     FROM bookings WHERE status = 'completed')                   AS total_commission,
    (SELECT COUNT(*)
     FROM bookings WHERE created_at > NOW() - INTERVAL '30 days') AS bookings_last_30d,
    (SELECT COUNT(*)
     FROM profiles WHERE created_at > NOW() - INTERVAL '30 days') AS new_users_last_30d,
    (SELECT COALESCE(ROUND(AVG(rating_overall)::numeric,2),0)
     FROM reviews)                                               AS platform_avg_rating;

-- ═══════════════════════════════════════════════════════════
-- VUE : Top artisans
-- ═══════════════════════════════════════════════════════════
CREATE VIEW top_artisans AS
SELECT
    p.full_name,
    a.business_name,
    p.city,
    a.rating_avg,
    a.review_count,
    a.completed_jobs,
    COALESCE(SUM(b.price_final), 0)     AS total_revenue,
    ARRAY_AGG(DISTINCT c.name)          AS categories,
    a.is_certified,
    a.is_premium
FROM artisans a
JOIN profiles p ON p.id = a.profile_id
LEFT JOIN bookings b ON b.artisan_id = a.id AND b.status = 'completed'
LEFT JOIN artisan_categories ac ON ac.artisan_id = a.id
LEFT JOIN categories c ON c.id = ac.category_id
GROUP BY a.id, p.id
ORDER BY a.rating_avg DESC, a.completed_jobs DESC;
```

---

## ÉTAPE 19 — JOBS pg_cron (Automatisations)

```sql
-- ═══════════════════════════════════════════════════════════
-- JOB 1 : Nettoyage créneaux expirés (chaque nuit à minuit)
-- ═══════════════════════════════════════════════════════════
SELECT cron.schedule(
    'cleanup-expired-slots',
    '0 0 * * *',
    $$
        DELETE FROM availability_slots
        WHERE slot_date < CURRENT_DATE
        AND is_booked = FALSE;
    $$
);

-- ═══════════════════════════════════════════════════════════
-- JOB 2 : Rappel réservation J-1 (chaque jour à 9h)
-- ═══════════════════════════════════════════════════════════
SELECT cron.schedule(
    'booking-reminder-j1',
    '0 9 * * *',
    $$
        INSERT INTO notifications (user_id, type, title, body, data)
        SELECT
            b.client_id,
            'booking_request',
            'Rappel : intervention demain',
            'Votre intervention est prévue demain à ' ||
            TO_CHAR(b.scheduled_time, 'HH24:MI'),
            jsonb_build_object('booking_id', b.id, 'booking_ref', b.booking_ref)
        FROM bookings b
        WHERE b.scheduled_date = CURRENT_DATE + 1
        AND b.status = 'confirmed';
    $$
);

-- ═══════════════════════════════════════════════════════════
-- JOB 3 : Archivage bookings anciens (1er de chaque mois)
-- ═══════════════════════════════════════════════════════════
SELECT cron.schedule(
    'archive-old-bookings',
    '0 2 1 * *',
    $$
        UPDATE bookings
        SET status = 'completed'
        WHERE status = 'in_progress'
        AND started_at < NOW() - INTERVAL '30 days';
    $$
);
```

---

*→ Voir 05_RLS_SECURITY.md pour les politiques de sécurité*  
*→ Voir 04_EDGE_FUNCTIONS.md pour les fonctions backend*
