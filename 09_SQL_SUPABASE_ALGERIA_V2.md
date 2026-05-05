# 09 — Schéma SQL Supabase V2 (Spécial Algérie & Architecture Sécurisée)

Ce script contient toute la structure de la base de données mise à jour selon le plan stratégique : sous-catégories, paiements CCP/BaridiMob, Sponsoring, et Logs d'audit.

## ⚠️ Instructions d'exécution
1. Allez dans votre projet Supabase > **SQL Editor**.
2. Créez une nouvelle requête (New Query).
3. Copiez-collez l'intégralité du code ci-dessous et cliquez sur **Run**.

```sql
-- ==============================================================================
-- 1. ACTIVATION DES EXTENSIONS
-- ==============================================================================
create extension if not exists "postgis" schema extensions;      -- Géolocalisation
create extension if not exists "pg_trgm" schema extensions;      -- Recherche texte fuzzy
create extension if not exists "uuid-ossp" schema extensions;    -- Génération UUID

-- ==============================================================================
-- 2. SCHÉMA UTILISATEURS ET ARTISANS
-- ==============================================================================

-- 2.1 Profils de base (Lié à auth.users)
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    role text not null check (role in ('client', 'artisan', 'admin')),
    full_name text not null,
    phone text unique,
    phone_verified boolean default false,
    avatar_url text,
    city text, -- Wilaya / Commune
    created_at timestamptz default now()
);
alter table public.profiles enable row level security;

-- 2.2 Profils spécifiques Artisans
create table public.artisans (
    id uuid references public.profiles(id) on delete cascade primary key,
    business_name text,
    bio text,
    siret text, -- Ou registre de commerce
    is_verified boolean default false,
    is_premium boolean default false,
    rating_avg numeric(3,2) default 0.0,
    review_count integer default 0,
    hourly_rate_min integer,
    hourly_rate_max integer,
    -- Géolocalisation PostGIS
    location geography(Point, 4326),
    intervention_radius_km integer default 20,
    created_at timestamptz default now()
);
alter table public.artisans enable row level security;

-- ==============================================================================
-- 3. CATÉGORIES ET SOUS-CATÉGORIES
-- ==============================================================================

create table public.categories (
    id uuid default uuid_generate_v4() primary key,
    slug text unique not null,
    name text not null,
    icon text not null,
    color text not null,
    is_popular boolean default false,
    created_at timestamptz default now()
);
alter table public.categories enable row level security;

create table public.subcategories (
    id uuid default uuid_generate_v4() primary key,
    category_id uuid references public.categories(id) on delete cascade,
    slug text unique not null,
    name text not null,
    created_at timestamptz default now()
);
alter table public.subcategories enable row level security;

-- Table de liaison (Relation Many-to-Many Artisan <-> Sous-catégories)
create table public.artisan_subcategories (
    artisan_id uuid references public.artisans(id) on delete cascade,
    subcategory_id uuid references public.subcategories(id) on delete cascade,
    primary key (artisan_id, subcategory_id)
);
alter table public.artisan_subcategories enable row level security;

-- ==============================================================================
-- 4. RÉSERVATIONS ET CONTACT (LEADS)
-- ==============================================================================

create table public.leads (
    id uuid default uuid_generate_v4() primary key,
    artisan_id uuid references public.artisans(id),
    client_id uuid references public.profiles(id),
    contact_channel text check (contact_channel in ('whatsapp', 'phone', 'chat')),
    status text default 'pending' check (status in ('pending', 'contacted', 'converted', 'spam')),
    created_at timestamptz default now()
);
alter table public.leads enable row level security;

create table public.bookings (
    id uuid default uuid_generate_v4() primary key,
    client_id uuid references public.profiles(id),
    artisan_id uuid references public.artisans(id),
    address text not null,
    gps_location geography(Point, 4326),
    scheduled_at timestamptz not null,
    status text default 'pending' check (status in ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed')),
    total_price numeric,
    created_at timestamptz default now()
);
alter table public.bookings enable row level security;

-- ==============================================================================
-- 5. PAIEMENTS ALGERIE (CCP, BARIDIMOB)
-- ==============================================================================

create table public.payments (
    id uuid default uuid_generate_v4() primary key,
    booking_id uuid references public.bookings(id),
    client_id uuid references public.profiles(id),
    amount numeric not null,
    payment_method text not null check (payment_method in ('baridimob', 'ccp', 'cash', 'cib')),
    proof_image_url text, -- Lien vers le reçu / carte
    reference_number text, -- Numéro de l'opération
    status text default 'pending_verification' check (status in ('pending_verification', 'verified', 'failed', 'refunded')),
    verified_by uuid references auth.users, -- Admin qui valide le CCP/Baridimob
    created_at timestamptz default now(),
    verified_at timestamptz
);
alter table public.payments enable row level security;

-- ==============================================================================
-- 6. SPONSORING ET PUBLICITÉ
-- ==============================================================================

create table public.sponsorship_campaigns (
    id uuid default uuid_generate_v4() primary key,
    artisan_id uuid references public.artisans(id),
    target_wilaya text,
    target_category_id uuid references public.categories(id),
    budget_dzd integer not null,
    spent_dzd integer default 0,
    status text default 'active' check (status in ('active', 'paused', 'exhausted')),
    start_date timestamptz default now(),
    end_date timestamptz,
    created_at timestamptz default now()
);
alter table public.sponsorship_campaigns enable row level security;

-- ==============================================================================
-- 7. SÉCURITÉ ET AUDIT (Inviolable)
-- ==============================================================================

create table public.audit_logs (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users,
    action text not null,
    entity text not null,
    entity_id uuid,
    details jsonb,
    ip_address text,
    created_at timestamptz default now()
);
-- ATTENTION : Pas de UPDATE ni DELETE sur les logs d'audit.
alter table public.audit_logs enable row level security;

-- ==============================================================================
-- 8. RLS POLICIES (EXEMPLES DE BASE)
-- ==============================================================================

-- Lecture publique pour les categories et profils artisans vérifiés
create policy "Categories and subcategories are viewable by everyone" on categories for select using (true);
create policy "Subcategories are viewable by everyone" on subcategories for select using (true);
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Artisans viewable by everyone." on artisans for select using (true);

-- L'utilisateur peut voir/modifier uniquement son profil
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Les audits sont en insertion pure (système ou triggers), lecture pour admins
create policy "Admins can view audit logs" on audit_logs for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- ==============================================================================
-- 9. TRIGGERS D'AUTOMATISATION
-- ==============================================================================
-- Création automatique de profil lors du Signup Supabase
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'role', 'client'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

```
