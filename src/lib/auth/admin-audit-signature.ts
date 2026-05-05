import type { AdminContext } from "@/lib/auth/require-admin";

export function buildAdminActorSignature(admin: AdminContext) {
    return {
        user_id: admin.user.id,
        email: admin.profile.email,
        full_name: admin.profile.full_name ?? null,
        admin_type: admin.adminType,
        is_owner: admin.isOwner,
        profile_role: admin.profile.role ?? null,
    };
}
