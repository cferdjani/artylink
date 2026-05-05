"use server";

import { buildAdminActorSignature } from "@/lib/auth/admin-audit-signature";
import { createSupabaseAdminClientOrNull } from "@/lib/supabase/admin";
import type { AdminContext } from "@/lib/auth/require-admin";

type AdminAuditLogInput = {
    admin: AdminContext;
    action: string;
    targetUserId?: string | null;
    payload?: Record<string, unknown>;
};

export async function appendAdminAuditLog(input: AdminAuditLogInput) {
    const supabaseAdmin = createSupabaseAdminClientOrNull();

    if (!supabaseAdmin) {
        console.error("[admin] audit skipped: SUPABASE_SERVICE_ROLE_KEY missing");
        return;
    }

    const signedPayload = {
        actor_signature: buildAdminActorSignature(input.admin),
        ...input.payload,
    };

    const { error } = await supabaseAdmin.from("admin_audit_logs").insert({
        actor_user_id: input.admin.user.id,
        target_user_id: input.targetUserId ?? null,
        action: input.action,
        payload: signedPayload,
    });

    if (error) {
        console.error("[admin] audit log insert failed:", error.message);
    }
}
