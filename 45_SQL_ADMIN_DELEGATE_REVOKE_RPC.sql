BEGIN;

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
    SELECT admin_type
    INTO v_admin_type
    FROM public.admin_accounts
    WHERE user_id = p_target_user_id;

    IF v_admin_type IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'reason', 'delegate_not_found'
        );
    END IF;

    IF v_admin_type <> 'delegate' THEN
        RETURN jsonb_build_object(
            'success', false,
            'reason', 'target_is_not_delegate'
        );
    END IF;

    DELETE FROM public.admin_permissions
    WHERE user_id = p_target_user_id;

    DELETE FROM public.admin_accounts
    WHERE user_id = p_target_user_id;

    INSERT INTO public.admin_audit_logs (
        actor_user_id,
        target_user_id,
        action,
        payload
    )
    VALUES (
        p_actor_user_id,
        p_target_user_id,
        'delegate_revoked',
        jsonb_build_object(
            'revoked_admin_access_only', true,
            'via_rpc', true,
            'actor_signature', COALESCE(p_actor_signature, '{}'::jsonb)
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'target_user_id', p_target_user_id
    );
END;
$$;

COMMIT;
