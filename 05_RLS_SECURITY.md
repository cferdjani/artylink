# 🔐 Sécurité RLS & Administration — Plateforme Artisans

---

## 🛡️ ROW LEVEL SECURITY (RLS) — Politiques Complètes

> Exécuter dans l'éditeur SQL Supabase après création des tables

### Activer RLS sur toutes les tables

```sql
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisans           ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisan_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services           ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews            ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites          ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports            ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories         ENABLE ROW LEVEL SECURITY;
```

---

### TABLE `profiles`

```sql
-- Lecture : profils actifs visibles par tous (publique)
CREATE POLICY "profiles_select_public"
ON profiles FOR SELECT
USING (is_active = TRUE);

-- Lecture : admin voit tous les profils
CREATE POLICY "profiles_select_admin"
ON profiles FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
);

-- Modification : seulement son propre profil
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Suppression : admin seulement
CREATE POLICY "profiles_delete_admin"
ON profiles FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
);
```

---

### TABLE `categories`

```sql
-- Lecture publique
CREATE POLICY "categories_select_public"
ON categories FOR SELECT
USING (is_active = TRUE);

-- Modification : admin seulement
CREATE POLICY "categories_all_admin"
ON categories FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);
```

---

### TABLE `artisans`

```sql
-- Lecture publique (pour la recherche)
CREATE POLICY "artisans_select_public"
ON artisans FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = profile_id AND is_active = TRUE
    )
);

-- Artisan modifie son propre profil
CREATE POLICY "artisans_update_own"
ON artisans FOR UPDATE
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

-- Admin peut tout modifier
CREATE POLICY "artisans_all_admin"
ON artisans FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);
```

---

### TABLE `services`

```sql
-- Lecture publique
CREATE POLICY "services_select_public"
ON services FOR SELECT
USING (is_active = TRUE);

-- Artisan gère ses propres services
CREATE POLICY "services_manage_own"
ON services FOR ALL
USING (
    artisan_id IN (
        SELECT id FROM artisans WHERE profile_id = auth.uid()
    )
)
WITH CHECK (
    artisan_id IN (
        SELECT id FROM artisans WHERE profile_id = auth.uid()
    )
);
```

---

### TABLE `portfolio_items`

```sql
-- Lecture publique
CREATE POLICY "portfolio_select_public"
ON portfolio_items FOR SELECT
USING (TRUE);

-- Artisan gère son portfolio
CREATE POLICY "portfolio_manage_own"
ON portfolio_items FOR ALL
USING (
    artisan_id IN (
        SELECT id FROM artisans WHERE profile_id = auth.uid()
    )
)
WITH CHECK (
    artisan_id IN (
        SELECT id FROM artisans WHERE profile_id = auth.uid()
    )
);
```

---

### TABLE `bookings`

```sql
-- Client et artisan voient leurs réservations
CREATE POLICY "bookings_select_parties"
ON bookings FOR SELECT
USING (
    client_id = auth.uid()
    OR artisan_id IN (
        SELECT id FROM artisans WHERE profile_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Client peut créer une réservation
CREATE POLICY "bookings_insert_client"
ON bookings FOR INSERT
WITH CHECK (
    client_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'client'
    )
);

-- Parties peuvent modifier le statut
CREATE POLICY "bookings_update_parties"
ON bookings FOR UPDATE
USING (
    client_id = auth.uid()
    OR artisan_id IN (
        SELECT id FROM artisans WHERE profile_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Pas de suppression (archivage uniquement)
-- Les bookings ne sont jamais supprimés, seulement archivés via status
```

---

### TABLE `reviews`

```sql
-- Lecture publique (reviews visibles)
CREATE POLICY "reviews_select_public"
ON reviews FOR SELECT
USING (is_visible = TRUE);

-- Client peut soumettre une review après une réservation terminée
CREATE POLICY "reviews_insert_client"
ON reviews FOR INSERT
WITH CHECK (
    client_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM bookings
        WHERE id = booking_id
        AND client_id = auth.uid()
        AND status = 'completed'
    )
    -- Pas de double review pour la même réservation
    AND NOT EXISTS (
        SELECT 1 FROM reviews r
        WHERE r.booking_id = booking_id
    )
);

-- Client peut modifier sa review (dans les 48h)
CREATE POLICY "reviews_update_own"
ON reviews FOR UPDATE
USING (
    client_id = auth.uid()
    AND created_at > NOW() - INTERVAL '48 hours'
);

-- Artisan peut répondre à une review qui le concerne
CREATE POLICY "reviews_reply_artisan"
ON reviews FOR UPDATE
USING (
    artisan_id IN (
        SELECT id FROM artisans WHERE profile_id = auth.uid()
    )
)
WITH CHECK (
    -- L'artisan ne peut que modifier artisan_reply
    client_id = (SELECT client_id FROM reviews WHERE id = reviews.id)
    AND rating_overall = (SELECT rating_overall FROM reviews WHERE id = reviews.id)
);

-- Admin peut modérer
CREATE POLICY "reviews_admin"
ON reviews FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);
```

---

### TABLE `messages`

```sql
-- Seulement les parties concernées
CREATE POLICY "messages_select_parties"
ON messages FOR SELECT
USING (
    sender_id = auth.uid()
    OR receiver_id = auth.uid()
);

-- Envoyer un message (authentifié)
CREATE POLICY "messages_insert_auth"
ON messages FOR INSERT
WITH CHECK (
    sender_id = auth.uid()
    AND auth.uid() IS NOT NULL
);

-- Marquer comme lu (destinataire seulement)
CREATE POLICY "messages_update_receiver"
ON messages FOR UPDATE
USING (receiver_id = auth.uid())
WITH CHECK (receiver_id = auth.uid());
```

---

### TABLE `notifications`

```sql
-- Seulement ses propres notifications
CREATE POLICY "notifications_own"
ON notifications FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Service role peut créer des notifications pour tous
-- (géré via Edge Functions avec service role key)
```

---

### TABLE `payments`

```sql
-- Client voit ses propres paiements
CREATE POLICY "payments_select_payer"
ON payments FOR SELECT
USING (
    payer_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.id = booking_id
        AND b.artisan_id IN (
            SELECT id FROM artisans WHERE profile_id = auth.uid()
        )
    )
    OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Création uniquement via Edge Functions (service role)
```

---

### TABLE `favorites`

```sql
-- Client voit ses favoris
CREATE POLICY "favorites_select_own"
ON favorites FOR SELECT
USING (client_id = auth.uid());

-- Client ajoute/supprime ses favoris
CREATE POLICY "favorites_manage_own"
ON favorites FOR ALL
USING (client_id = auth.uid())
WITH CHECK (client_id = auth.uid());
```

---

### TABLE `availability_slots`

```sql
-- Lecture publique (pour voir les créneaux disponibles)
CREATE POLICY "slots_select_public"
ON availability_slots FOR SELECT
USING (TRUE);

-- Artisan gère ses créneaux
CREATE POLICY "slots_manage_own"
ON availability_slots FOR ALL
USING (
    artisan_id IN (
        SELECT id FROM artisans WHERE profile_id = auth.uid()
    )
)
WITH CHECK (
    artisan_id IN (
        SELECT id FROM artisans WHERE profile_id = auth.uid()
    )
);
```

---

### TABLE `reports`

```sql
-- Reporter voit ses propres signalements
CREATE POLICY "reports_select_own"
ON reports FOR SELECT
USING (
    reporter_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Tout utilisateur peut signaler
CREATE POLICY "reports_insert_auth"
ON reports FOR INSERT
WITH CHECK (
    reporter_id = auth.uid()
    AND auth.uid() IS NOT NULL
);

-- Admin peut traiter les signalements
CREATE POLICY "reports_update_admin"
ON reports FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);
```

---

## 🏛️ PANEL ADMINISTRATION

### Routes Admin (protégées)

```dart
// lib/core/router/app_router.dart — Route Admin

GoRoute(
  path: '/admin',
  redirect: (context, state) async {
    final profile = await AuthRepository().getCurrentProfile();
    return profile?.role == 'admin' ? null : '/';
  },
  routes: [
    GoRoute(path: '',         builder: (_, __) => const AdminDashboardPage()),
    GoRoute(path: 'artisans', builder: (_, __) => const AdminArtisansPage()),
    GoRoute(path: 'bookings', builder: (_, __) => const AdminBookingsPage()),
    GoRoute(path: 'payments', builder: (_, __) => const AdminPaymentsPage()),
    GoRoute(path: 'reports',  builder: (_, __) => const AdminReportsPage()),
    GoRoute(path: 'users',    builder: (_, __) => const AdminUsersPage()),
  ],
),
```

### Vues SQL Admin

```sql
-- ═══════════════════════════════════════════════════════════
-- VUE : KPIs Temps Réel Admin Dashboard
-- ═══════════════════════════════════════════════════════════
CREATE VIEW admin_kpis AS
SELECT
    -- Utilisateurs
    (SELECT COUNT(*) FROM profiles WHERE role = 'client')         AS total_clients,
    (SELECT COUNT(*) FROM profiles WHERE role = 'artisan')        AS total_artisans,
    (SELECT COUNT(*) FROM artisans WHERE is_verified = TRUE)      AS verified_artisans,
    (SELECT COUNT(*) FROM artisans WHERE is_premium = TRUE)       AS premium_artisans,

    -- Bookings
    (SELECT COUNT(*) FROM bookings)                               AS total_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'pending')      AS pending_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed')    AS confirmed_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'completed')    AS completed_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'cancelled')    AS cancelled_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'disputed')     AS disputed_bookings,

    -- Revenus
    (SELECT COALESCE(SUM(price_final), 0)
     FROM bookings WHERE status = 'completed')                    AS total_revenue,
    (SELECT COALESCE(SUM(commission_amount), 0)
     FROM bookings WHERE status = 'completed')                    AS total_commission,

    -- Période courante (30 derniers jours)
    (SELECT COUNT(*)
     FROM bookings WHERE created_at > NOW() - INTERVAL '30 days') AS bookings_30d,
    (SELECT COUNT(*)
     FROM profiles WHERE created_at > NOW() - INTERVAL '30 days') AS new_users_30d,
    (SELECT COALESCE(SUM(price_final), 0)
     FROM bookings
     WHERE status = 'completed'
     AND completed_at > NOW() - INTERVAL '30 days')              AS revenue_30d,

    -- Qualité
    (SELECT COALESCE(ROUND(AVG(rating_overall)::numeric, 2), 0)
     FROM reviews)                                                AS platform_avg_rating,
    (SELECT COUNT(*) FROM reviews WHERE created_at > NOW() - INTERVAL '7 days') AS reviews_7d,
    (SELECT COUNT(*) FROM reports WHERE status = 'pending')       AS pending_reports;

-- ═══════════════════════════════════════════════════════════
-- VUE : Artisans à valider
-- ═══════════════════════════════════════════════════════════
CREATE VIEW admin_pending_artisans AS
SELECT
    a.id            AS artisan_id,
    p.full_name,
    p.email,
    p.phone,
    p.city,
    a.business_name,
    a.siret,
    a.bio,
    a.years_experience,
    a.created_at,
    ARRAY_AGG(DISTINCT c.name) AS categories
FROM artisans a
JOIN profiles p ON p.id = a.profile_id
LEFT JOIN artisan_categories ac ON ac.artisan_id = a.id
LEFT JOIN categories c ON c.id = ac.category_id
WHERE a.is_certified = FALSE
AND p.is_active = TRUE
GROUP BY a.id, p.id
ORDER BY a.created_at ASC;

-- ═══════════════════════════════════════════════════════════
-- VUE : Évolution mensuelle (12 derniers mois)
-- ═══════════════════════════════════════════════════════════
CREATE VIEW monthly_stats AS
SELECT
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*)                        AS new_bookings,
    COALESCE(SUM(price_final), 0)   AS revenue,
    COALESCE(SUM(commission_amount), 0) AS commission
FROM bookings
WHERE created_at > NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month ASC;
```

### Fonctions Admin

```sql
-- Certifier un artisan
CREATE OR REPLACE FUNCTION admin_certify_artisan(
    p_artisan_id UUID,
    p_badges     TEXT[] DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
    UPDATE artisans
    SET
        is_certified = TRUE,
        badges = p_badges,
        updated_at = NOW()
    WHERE id = p_artisan_id;

    -- Notifier l'artisan
    INSERT INTO notifications (user_id, type, title, body)
    SELECT
        profile_id,
        'system',
        '🎉 Compte certifié !',
        'Votre profil a été certifié par l''équipe ArtisansPlus.'
    FROM artisans WHERE id = p_artisan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Suspendre un utilisateur
CREATE OR REPLACE FUNCTION admin_suspend_user(
    p_user_id   UUID,
    p_reason    TEXT
)
RETURNS VOID AS $$
BEGIN
    UPDATE profiles
    SET is_active = FALSE
    WHERE id = p_user_id;

    -- Annuler les réservations en cours
    UPDATE bookings
    SET
        status = 'cancelled',
        cancel_reason = 'Compte suspendu : ' || p_reason,
        cancelled_at = NOW()
    WHERE
        (client_id = p_user_id OR
         artisan_id IN (SELECT id FROM artisans WHERE profile_id = p_user_id))
        AND status IN ('pending', 'confirmed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Résoudre un signalement
CREATE OR REPLACE FUNCTION admin_resolve_report(
    p_report_id UUID,
    p_status    TEXT,        -- 'resolved' | 'dismissed'
    p_notes     TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE reports
    SET
        status = p_status,
        admin_notes = p_notes,
        resolved_at = NOW()
    WHERE id = p_report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rembourser une réservation
CREATE OR REPLACE FUNCTION admin_refund_booking(
    p_booking_id UUID,
    p_reason     TEXT
)
RETURNS VOID AS $$
BEGIN
    UPDATE bookings
    SET
        status = 'cancelled',
        payment_status = 'refunded',
        cancel_reason = p_reason,
        cancelled_at = NOW()
    WHERE id = p_booking_id;

    UPDATE payments
    SET
        status = 'refunded',
        refunded_at = NOW(),
        refund_reason = p_reason
    WHERE booking_id = p_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 📊 MONITORING & ALERTES

### Supabase Storage — Buckets

```sql
-- Créer les buckets de stockage
INSERT INTO storage.buckets (id, name, public) VALUES
    ('avatars',    'avatars',    TRUE),    -- Photos de profil (publiques)
    ('portfolio',  'portfolio',  TRUE),    -- Réalisations artisans (publiques)
    ('documents',  'documents',  FALSE),   -- Documents confidentiels
    ('bookings',   'bookings',   FALSE);   -- Photos avant/après intervention

-- Politiques Storage
CREATE POLICY "Avatars publics"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Portfolio public"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio');

CREATE POLICY "Upload avatar propre"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Upload portfolio artisan"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'portfolio'
    AND EXISTS (
        SELECT 1 FROM artisans
        WHERE profile_id = auth.uid()
    )
);

CREATE POLICY "Documents privés"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Alertes & Monitoring

```sql
-- Fonction d'alerte : booking non confirmé depuis 24h
CREATE OR REPLACE FUNCTION alert_unconfirmed_bookings()
RETURNS TABLE(
    booking_id  UUID,
    booking_ref TEXT,
    artisan_id  UUID,
    client_name TEXT,
    created_at  TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.id,
        b.booking_ref,
        b.artisan_id,
        p.full_name,
        b.created_at
    FROM bookings b
    JOIN profiles p ON p.id = b.client_id
    WHERE b.status = 'pending'
    AND b.created_at < NOW() - INTERVAL '24 hours'
    ORDER BY b.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Vue taux de conversion
CREATE VIEW conversion_funnel AS
SELECT
    (SELECT COUNT(*) FROM profiles WHERE role = 'client')         AS total_clients,
    (SELECT COUNT(DISTINCT client_id) FROM bookings)              AS clients_with_booking,
    (SELECT COUNT(DISTINCT client_id) FROM bookings
     WHERE status = 'completed')                                  AS clients_completed,
    (SELECT COUNT(*) FROM bookings)                               AS total_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'completed')    AS completed_bookings,
    ROUND(
        (SELECT COUNT(*) FROM bookings WHERE status = 'completed')::numeric /
        NULLIF((SELECT COUNT(*) FROM bookings), 0) * 100, 2
    )                                                             AS completion_rate_pct;
```

---

## 📋 Checklist Sécurité Production

### Avant la mise en production

```
□ RLS activé sur toutes les tables
□ Politiques RLS testées avec différents rôles
□ Clés API en variables d'environnement (jamais en dur)
□ HTTPS forcé sur tous les endpoints
□ Rate limiting configuré (Supabase Dashboard)
□ Webhook Stripe avec signature vérifiée
□ Emails de confirmation activés (Supabase Auth)
□ Buckets Storage avec politiques appropriées
□ Logs d'audit activés pour les tables sensibles
□ Sauvegarde automatique Supabase activée
□ Monitoring des Edge Functions configuré
□ SIRET validation côté Edge Function
□ Vérification manuelle artisans (KBIS, assurance)
□ CGU/CGV acceptées à l'inscription
□ RGPD : politique de confidentialité + suppression données
□ Paiements : conformité PCI-DSS via Stripe (pas de stockage CB)
```

---

*→ Voir 04_EDGE_FUNCTIONS.md pour les fonctions backend*  
*→ Voir 06_ADMIN_MONITORING.md pour le dashboard admin*
