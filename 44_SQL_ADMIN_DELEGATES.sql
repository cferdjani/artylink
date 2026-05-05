BEGIN;

CREATE TABLE IF NOT EXISTS public.admin_accounts (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    admin_type TEXT NOT NULL CHECK (admin_type IN ('owner', 'delegate')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_permissions (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    can_view_dashboard BOOLEAN NOT NULL DEFAULT FALSE,
    can_manage_users BOOLEAN NOT NULL DEFAULT FALSE,
    can_manage_payments BOOLEAN NOT NULL DEFAULT FALSE,
    can_manage_sponsoring BOOLEAN NOT NULL DEFAULT FALSE,
    can_manage_support_logs BOOLEAN NOT NULL DEFAULT FALSE,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_accounts_type_active
    ON public.admin_accounts (admin_type, is_active);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_actor_created_at
    ON public.admin_audit_logs (actor_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target_created_at
    ON public.admin_audit_logs (target_user_id, created_at DESC);

ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own admin account" ON public.admin_accounts;
CREATE POLICY "Users can read own admin account"
    ON public.admin_accounts
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own admin permissions" ON public.admin_permissions;
CREATE POLICY "Users can read own admin permissions"
    ON public.admin_permissions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

INSERT INTO public.admin_accounts (
    user_id,
    admin_type,
    is_active,
    created_at,
    updated_at
)
SELECT
    profiles.id,
    'owner',
    TRUE,
    NOW(),
    NOW()
FROM public.profiles
WHERE LOWER(COALESCE(profiles.email, '')) = LOWER('oucher007@gmail.com')
ON CONFLICT (user_id) DO UPDATE
SET
    admin_type = 'owner',
    is_active = TRUE,
    updated_at = NOW();

INSERT INTO public.admin_permissions (
    user_id,
    can_view_dashboard,
    can_manage_users,
    can_manage_payments,
    can_manage_sponsoring,
    can_manage_support_logs,
    updated_at
)
SELECT
    profiles.id,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    NOW()
FROM public.profiles
WHERE LOWER(COALESCE(profiles.email, '')) = LOWER('oucher007@gmail.com')
ON CONFLICT (user_id) DO UPDATE
SET
    can_view_dashboard = TRUE,
    can_manage_users = TRUE,
    can_manage_payments = TRUE,
    can_manage_sponsoring = TRUE,
    can_manage_support_logs = TRUE,
    updated_at = NOW();

COMMIT;
