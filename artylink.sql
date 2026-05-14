-- SCHEMA ARTYLINK - Source de vérité pour la base de données
-- NE PAS MODIFIER CE FICHIER SAUF EN CAS DE MIGRATION VALIDÉE
-- Ce fichier sert de référence absolue pour les agents (noms de tables, colonnes, contraintes CHECK)

CREATE TABLE public.admin_accounts (
  user_id uuid NOT NULL,
  admin_type text NOT NULL CHECK (admin_type = ANY (ARRAY['owner'::text, 'delegate'::text])),
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  updated_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  activation_status text NOT NULL DEFAULT 'active'::text CHECK (activation_status = ANY (ARRAY['pending'::text, 'active'::text, 'declined'::text])),
  activated_at timestamp with time zone,
  declined_at timestamp with time zone,
  CONSTRAINT admin_accounts_pkey PRIMARY KEY (user_id),
  CONSTRAINT admin_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT admin_accounts_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT admin_accounts_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);
CREATE TABLE public.admin_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_user_id uuid NOT NULL,
  target_user_id uuid,
  action text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT admin_audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT admin_audit_logs_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES auth.users(id),
  CONSTRAINT admin_audit_logs_target_user_id_fkey FOREIGN KEY (target_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.admin_delegate_secrets (
  user_id uuid NOT NULL,
  secret_hash text NOT NULL,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  consumed_at timestamp with time zone,
  invalidated_at timestamp with time zone,
  last_rotated_at timestamp with time zone,
  CONSTRAINT admin_delegate_secrets_pkey PRIMARY KEY (user_id),
  CONSTRAINT admin_delegate_secrets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT admin_delegate_secrets_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.admin_permissions (
  user_id uuid NOT NULL,
  can_view_dashboard boolean NOT NULL DEFAULT false,
  can_manage_users boolean NOT NULL DEFAULT false,
  can_manage_payments boolean NOT NULL DEFAULT false,
  can_manage_sponsoring boolean NOT NULL DEFAULT false,
  can_manage_support_logs boolean NOT NULL DEFAULT false,
  updated_by uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT admin_permissions_pkey PRIMARY KEY (user_id),
  CONSTRAINT admin_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT admin_permissions_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);
CREATE TABLE public.algeria_cities (
  id integer NOT NULL,
  commune_name character varying NOT NULL,
  commune_name_ascii character varying NOT NULL,
  daira_name character varying NOT NULL,
  daira_name_ascii character varying NOT NULL,
  wilaya_code character varying NOT NULL,
  wilaya_name character varying NOT NULL,
  wilaya_name_ascii character varying NOT NULL,
  CONSTRAINT algeria_cities_pkey PRIMARY KEY (id)
);
CREATE TABLE public.artisan_categories (
  artisan_id uuid NOT NULL,
  category_id uuid NOT NULL,
  is_primary boolean DEFAULT false,
  CONSTRAINT artisan_categories_pkey PRIMARY KEY (artisan_id, category_id),
  CONSTRAINT artisan_categories_artisan_id_fkey FOREIGN KEY (artisan_id) REFERENCES public.artisans(id),
  CONSTRAINT artisan_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.artisan_payments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  artisan_id uuid NOT NULL,
  amount numeric NOT NULL,
  payment_method text NOT NULL CHECK (payment_method = ANY (ARRAY['baridimob'::text, 'ccp'::text, 'cash'::text])),
  receipt_image_url text NOT NULL,
  plan_type text NOT NULL CHECK (plan_type = ANY (ARRAY['premium_1_month'::text, 'premium_1_year'::text, 'boost_7_days'::text])),
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  admin_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT artisan_payments_pkey PRIMARY KEY (id),
  CONSTRAINT artisan_payments_artisan_id_fkey FOREIGN KEY (artisan_id) REFERENCES public.artisans(id)
);
CREATE TABLE public.artisan_portfolios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  artisan_id uuid NOT NULL,
  image_url text NOT NULL,
  caption text,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT artisan_portfolios_pkey PRIMARY KEY (id),
  CONSTRAINT artisan_portfolios_artisan_id_fkey FOREIGN KEY (artisan_id) REFERENCES public.artisans(id)
);
CREATE TABLE public.artisan_subcategories (
  artisan_id uuid NOT NULL,
  subcategory_id uuid NOT NULL,
  CONSTRAINT artisan_subcategories_pkey PRIMARY KEY (artisan_id, subcategory_id)
);
CREATE TABLE public.artisans (
  id uuid NOT NULL,
  bio text,
  company_name text,
  wilaya text NOT NULL,
  city text,
  address text,
  longitude double precision,
  latitude double precision,
  years_of_experience integer DEFAULT 0,
  rating double precision DEFAULT 0,
  review_count integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  verification_date timestamp with time zone,
  hourly_rate numeric,
  currency text DEFAULT 'DZD'::text,
  availability_status text DEFAULT 'available'::text CHECK (availability_status = ANY (ARRAY['available'::text, 'busy'::text, 'unavailable'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  city_id integer,
  wilaya_code character varying CHECK (wilaya_code IS NULL OR wilaya_code::text ~ '^[0-9]{2}$'::text),
  subscription_tier text DEFAULT 'free'::text CHECK (subscription_tier = ANY (ARRAY['free'::text, 'premium'::text, 'vip'::text])),
  boost_expires_at timestamp with time zone,
  is_sponsored boolean DEFAULT false,
  profession text,
  specialties ARRAY DEFAULT '{}'::text[],
  CONSTRAINT artisans_pkey PRIMARY KEY (id),
  CONSTRAINT artisans_id_fkey FOREIGN KEY (id) REFERENCES public.profiles(id),
  CONSTRAINT artisans_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.algeria_cities(id)
);
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.bookings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  client_id uuid NOT NULL,
  artisan_id uuid NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'completed'::text, 'cancelled'::text])),
  scheduled_date timestamp with time zone,
  price_agreed numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id),
  CONSTRAINT bookings_artisan_id_fkey FOREIGN KEY (artisan_id) REFERENCES public.artisans(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  icon text,
  color text,
  is_popular boolean DEFAULT false,
  meta_title text,
  meta_description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  media_type text,
  content text,
  media_url text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_messages_pkey PRIMARY KEY (id),
  CONSTRAINT chat_messages_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.chat_rooms(id),
  CONSTRAINT chat_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.chat_rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  participant_1 uuid NOT NULL,
  participant_2 uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  last_message_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_rooms_pkey PRIMARY KEY (id),
  CONSTRAINT chat_rooms_participant_1_fkey FOREIGN KEY (participant_1) REFERENCES public.profiles(id),
  CONSTRAINT chat_rooms_participant_2_fkey FOREIGN KEY (participant_2) REFERENCES public.profiles(id)
);
CREATE TABLE public.communes (
  id integer NOT NULL,
  wilaya_code integer NOT NULL,
  name_fr text NOT NULL,
  name_ar text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT communes_pkey PRIMARY KEY (id),
  CONSTRAINT communes_wilaya_code_fkey FOREIGN KEY (wilaya_code) REFERENCES public.wilayas(code)
);
CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  client_id uuid NOT NULL,
  artisan_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id),
  CONSTRAINT conversations_artisan_id_fkey FOREIGN KEY (artisan_id) REFERENCES public.artisans(id)
);
CREATE TABLE public.lead_clicks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  artisan_id uuid NOT NULL,
  viewer_id uuid,
  action_type text NOT NULL CHECK (action_type = ANY (ARRAY['view_phone'::text, 'whatsapp_click'::text, 'message_click'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lead_clicks_pkey PRIMARY KEY (id),
  CONSTRAINT lead_clicks_viewer_id_fkey FOREIGN KEY (viewer_id) REFERENCES public.profiles(id),
  CONSTRAINT lead_clicks_artisan_id_fkey FOREIGN KEY (artisan_id) REFERENCES public.artisans(id)
);
CREATE TABLE public.leads (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  artisan_id uuid,
  client_id uuid,
  contact_channel text CHECK (contact_channel = ANY (ARRAY['whatsapp'::text, 'phone'::text, 'chat'::text])),
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'contacted'::text, 'converted'::text, 'spam'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT leads_pkey PRIMARY KEY (id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['rfq_new'::text, 'bid_received'::text, 'message'::text, 'sys'::text])),
  title text NOT NULL,
  content text NOT NULL,
  link_url text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.payment_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount_dzd numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending_payment'::text CHECK (status = ANY (ARRAY['pending_payment'::text, 'under_review'::text, 'completed'::text, 'rejected'::text])),
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT payment_orders_pkey PRIMARY KEY (id),
  CONSTRAINT payment_orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.payment_proofs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE,
  payment_method text NOT NULL CHECK (payment_method = ANY (ARRAY['baridimob'::text, 'ccp'::text, 'cash'::text])),
  proof_url text NOT NULL,
  transaction_reference text,
  status text NOT NULL DEFAULT 'under_review'::text CHECK (status = ANY (ARRAY['under_review'::text, 'approved'::text, 'rejected'::text])),
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  admin_notes text,
  CONSTRAINT payment_proofs_pkey PRIMARY KEY (id),
  CONSTRAINT payment_proofs_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.payment_orders(id),
  CONSTRAINT payment_proofs_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  booking_id uuid,
  client_id uuid,
  amount numeric NOT NULL,
  payment_method text NOT NULL CHECK (payment_method = ANY (ARRAY['baridimob'::text, 'ccp'::text, 'cash'::text, 'cib'::text])),
  proof_image_url text,
  reference_number text,
  status text DEFAULT 'pending_verification'::text CHECK (status = ANY (ARRAY['pending_verification'::text, 'verified'::text, 'failed'::text, 'refunded'::text])),
  verified_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  verified_at timestamp with time zone,
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES auth.users(id)
);
CREATE TABLE public.profile_views (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  artisan_id uuid NOT NULL,
  viewer_id uuid,
  viewer_ip text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profile_views_pkey PRIMARY KEY (id),
  CONSTRAINT profile_views_artisan_id_fkey FOREIGN KEY (artisan_id) REFERENCES public.artisans(id),
  CONSTRAINT profile_views_viewer_id_fkey FOREIGN KEY (viewer_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  phone text UNIQUE,
  role text NOT NULL DEFAULT 'client'::text CHECK (role = ANY (ARRAY['client'::text, 'artisan'::text, 'admin'::text])),
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  city text,
  first_name text,
  last_name text,
  age integer CHECK (age IS NULL OR age >= 18 AND age <= 100),
  wilaya text,
  commune text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.promo_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_amount_dzd numeric NOT NULL,
  max_usages integer NOT NULL DEFAULT 1,
  current_usages integer NOT NULL DEFAULT 0,
  valid_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT promo_codes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.qualification_answers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  artisan_id uuid NOT NULL UNIQUE,
  answers_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT qualification_answers_pkey PRIMARY KEY (id),
  CONSTRAINT qualification_answers_artisan_id_fkey FOREIGN KEY (artisan_id) REFERENCES public.artisans(id)
);
CREATE TABLE public.qualification_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_slug text NOT NULL UNIQUE,
  schema_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  CONSTRAINT qualification_templates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.referral_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  reward_amount_dzd numeric NOT NULL DEFAULT 500.00,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT referral_codes_pkey PRIMARY KEY (id),
  CONSTRAINT referral_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  booking_id uuid UNIQUE,
  client_id uuid NOT NULL,
  artisan_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id),
  CONSTRAINT reviews_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id),
  CONSTRAINT reviews_artisan_id_fkey FOREIGN KEY (artisan_id) REFERENCES public.artisans(id)
);
CREATE TABLE public.rfq_bids (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  rfq_id uuid NOT NULL,
  artisan_id uuid NOT NULL,
  proposal text NOT NULL,
  price numeric,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT rfq_bids_pkey PRIMARY KEY (id),
  CONSTRAINT rfq_bids_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES public.rfq_posts(id),
  CONSTRAINT rfq_bids_artisan_id_fkey FOREIGN KEY (artisan_id) REFERENCES public.artisans(id)
);
CREATE TABLE public.rfq_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  category_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  budget_range text,
  wilaya text,
  status text DEFAULT 'open'::text CHECK (status = ANY (ARRAY['open'::text, 'closed'::text, 'completed'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT rfq_posts_pkey PRIMARY KEY (id),
  CONSTRAINT rfq_posts_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id),
  CONSTRAINT rfq_posts_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.sponsored_ads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image_url text,
  external_url text,
  ad_type text NOT NULL CHECK (ad_type = ANY (ARRAY['sponsor'::text, 'produit_pub'::text])),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sponsored_ads_pkey PRIMARY KEY (id)
);
CREATE TABLE public.sponsored_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type = ANY (ARRAY['artisan'::text, 'sponsor'::text])),
  payload jsonb,
  image_path text,
  start_at timestamp with time zone NOT NULL DEFAULT now(),
  end_at timestamp with time zone NOT NULL DEFAULT (now() + '7 days'::interval),
  duration_seconds integer DEFAULT 20,
  link text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  priority integer DEFAULT 0,
  CONSTRAINT sponsored_items_pkey PRIMARY KEY (id)
);
CREATE TABLE public.sponsorship_campaigns (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  artisan_id uuid,
  target_wilaya text,
  target_category_id uuid,
  budget_dzd integer NOT NULL,
  spent_dzd integer DEFAULT 0,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'paused'::text, 'exhausted'::text])),
  start_date timestamp with time zone DEFAULT now(),
  end_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sponsorship_campaigns_pkey PRIMARY KEY (id)
);
CREATE TABLE public.subcategories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  category_id uuid,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  meta_title text,
  meta_description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subcategories_pkey PRIMARY KEY (id),
  CONSTRAINT subcategories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  plan_type text NOT NULL CHECK (plan_type = ANY (ARRAY['free'::text, 'starter'::text, 'pro'::text])),
  status text NOT NULL CHECK (status = ANY (ARRAY['active'::text, 'cancelled'::text, 'expired'::text])),
  valid_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.wallet_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount_dzd numeric NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type = ANY (ARRAY['credit'::text, 'debit'::text])),
  reference_type text NOT NULL CHECK (reference_type = ANY (ARRAY['payment_proof'::text, 'promo_code'::text, 'referral'::text, 'manual_admin'::text, 'service_purchase'::text])),
  reference_id uuid,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT wallet_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT wallet_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.wilayas (
  code integer NOT NULL,
  name_fr text NOT NULL,
  name_ar text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT wilayas_pkey PRIMARY KEY (code)
);
