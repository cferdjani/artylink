import { adminGetArtisans } from "@/lib/actions/users-admin";
import { getAdminLandingPath } from "@/lib/auth/admin-access";
import { getAdminContext } from "@/lib/auth/require-admin";
import { redirect } from "next/navigation";
import AdminUsersClient from "./AdminUsersClient";

export const metadata = {
    title: "Cartes Artisans | Super Admin"
};

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
    const admin = await getAdminContext();
    if (!admin.isOwner && !admin.permissions.can_manage_users) {
        redirect(getAdminLandingPath({
            isOwner: admin.isOwner,
            permissions: admin.permissions,
        }));
    }

    const artisans = await adminGetArtisans();

    return <AdminUsersClient initialArtisans={artisans} />;
}
