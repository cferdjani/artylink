BEGIN;

-- Ajout des champs d'activation
ALTER TABLE public.admin_accounts
ADD COLUMN IF NOT EXISTS activation_status TEXT NOT NULL DEFAULT 'active' CHECK (activation_status IN ('pending', 'active', 'declined')),
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS declined_at TIMESTAMPTZ;

-- Table dédiée pour les secrets d'activation (hashés)
CREATE TABLE IF NOT EXISTS public.admin_delegate_secrets (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    secret_hash TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    consumed_at TIMESTAMPTZ,
    invalidated_at TIMESTAMPTZ,
    last_rotated_at TIMESTAMPTZ
);

ALTER TABLE public.admin_delegate_secrets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own secret" ON public.admin_delegate_secrets;
CREATE POLICY "Users can read own secret"
    ON public.admin_delegate_secrets
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Mise à jour de la RPC de révocation pour nettoyer les secrets
CREATE OR REPLACE FUNCTION public.revoke_admin_delegate_access(
    p_actor_user_id UUID,
    p_target_user_id UUID,
    p_actor_signature JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin_type TEXT;
BEGIN
    SELECT admin_type INTO v_admin_type FROM public.admin_accounts WHERE user_id = p_target_user_id;
    IF v_admin_type IS NULL THEN RETURN jsonb_build_object('success', false, 'reason', 'delegate_not_found'); END IF;
    IF v_admin_type <> 'delegate' THEN RETURN jsonb_build_object('success', false, 'reason', 'target_is_not_delegate'); END IF;

    DELETE FROM public.admin_permissions WHERE user_id = p_target_user_id;
    DELETE FROM public.admin_accounts WHERE user_id = p_target_user_id;
    DELETE FROM public.admin_delegate_secrets WHERE user_id = p_target_user_id;

    INSERT INTO public.admin_audit_logs (actor_user_id, target_user_id, action, payload)
    VALUES (
        p_actor_user_id, p_target_user_id, 'delegate_revoked',
        jsonb_build_object('revoked_admin_access_only', true, 'via_rpc', true, 'actor_signature', COALESCE(p_actor_signature, '{}'::jsonb))
    );

    RETURN jsonb_build_object('success', true, 'target_user_id', p_target_user_id);
END;
$$;

COMMIT;