"use server";

import { appendAdminAuditLog } from "@/lib/actions/admin-audit";
import { requireAdminAccess } from "@/lib/auth/require-admin";
import { createSupabaseAdminClient, createSupabaseAdminClientOrNull } from "@/lib/supabase/admin";
import { normalizeSponsoredModerationStatus } from "@/lib/sponsored-campaigns";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

const SPONSORED_IMAGE_BUCKET = "demos";
const MAX_SPONSORED_IMAGE_BYTES = 5 * 1024 * 1024;
const SPONSORED_IMAGE_MIME_TYPES = new Map([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
    ["image/gif", "gif"],
]);

export type SponsoredItemAdminRow = {
    id: string;
    type: "artisan" | "sponsor";
    payload: Record<string, unknown> | null;
    image_path: string | null;
    link: string | null;
    duration_seconds: number | null;
    start_at: string;
    end_at: string;
    created_at: string;
};

type SponsoredItemActionRow = {
    id: string;
    type: "artisan" | "sponsor";
    payload: Record<string, unknown> | null;
    image_path: string | null;
    link: string | null;
    duration_seconds: number | null;
    start_at: string;
    end_at: string;
};

export type SponsoredCampaignFormItem = {
    id: string;
    type: "artisan" | "sponsor";
    title: string;
    subtitle: string;
    image_path: string | null;
    link: string | null;
    duration_seconds: number | null;
    start_at: string;
    end_at: string;
    payload: Record<string, unknown> | null;
};

export type AdminArtisanSearchResult = {
    id: string;
    fullName: string;
    profession: string | null;
    companyName: string | null;
};

function readPayloadString(payload: Record<string, unknown> | null, key: string) {
    const value = payload?.[key];
    return typeof value === "string" ? value : "";
}

function buildPayloadPatch(
    payload: Record<string, unknown> | null,
    patch: Record<string, unknown>,
) {
    return {
        ...(payload ?? {}),
        ...patch,
    };
}

function normalizeAdminNote(note?: string) {
    const trimmed = note?.trim();
    return trimmed ? trimmed : null;
}

function normalizeFormString(value: FormDataEntryValue | null) {
    const raw = value?.toString().trim() ?? "";
    return raw.length > 0 ? raw : "";
}

function parsePositiveInteger(value: FormDataEntryValue | null, fallback: number) {
    const parsed = Number.parseInt(value?.toString() ?? "", 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseNullableString(value: FormDataEntryValue | null) {
    const normalized = normalizeFormString(value);
    return normalized || null;
}

function parseLocalDateTime(value: string) {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.valueOf())) {
        throw new Error("La date de début est invalide");
    }
    return parsed;
}

function isUploadFile(value: FormDataEntryValue | null): value is File {
    return (
        typeof value === "object"
        && value !== null
        && "size" in value
        && typeof value.size === "number"
        && "type" in value
        && typeof value.type === "string"
        && "arrayBuffer" in value
        && typeof value.arrayBuffer === "function"
    );
}

async function ensureSponsoredImageBucket(supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>) {
    const { error } = await supabaseAdmin.storage.getBucket(SPONSORED_IMAGE_BUCKET);

    if (!error) {
        return;
    }

    const { error: createError } = await supabaseAdmin.storage.createBucket(SPONSORED_IMAGE_BUCKET, {
        public: true,
        allowedMimeTypes: Array.from(SPONSORED_IMAGE_MIME_TYPES.keys()),
        fileSizeLimit: MAX_SPONSORED_IMAGE_BYTES,
    });

    if (createError && !createError.message.toLowerCase().includes("already exists")) {
        throw new Error(`Impossible de préparer le bucket ${SPONSORED_IMAGE_BUCKET}: ${createError.message}`);
    }
}

async function uploadSponsoredImage(
    supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>,
    fileValue: FormDataEntryValue | null,
) {
    if (!isUploadFile(fileValue) || fileValue.size === 0) {
        return null;
    }

    if (fileValue.size > MAX_SPONSORED_IMAGE_BYTES) {
        throw new Error("L'image sponsoring ne doit pas dépasser 5 Mo.");
    }

    const extension = SPONSORED_IMAGE_MIME_TYPES.get(fileValue.type);
    if (!extension) {
        throw new Error("Format image non supporté. Utilisez JPG, PNG, WebP ou GIF.");
    }

    await ensureSponsoredImageBucket(supabaseAdmin);

    const uploadPath = `sponsoring/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;
    const { error } = await supabaseAdmin.storage
        .from(SPONSORED_IMAGE_BUCKET)
        .upload(uploadPath, fileValue, {
            contentType: fileValue.type,
            cacheControl: "31536000",
            upsert: false,
        });

    if (error) {
        throw new Error(`Impossible d'uploader l'image sponsoring: ${error.message}`);
    }

    return uploadPath;
}

async function rollbackSponsoredImageUpload(
    supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>,
    imagePath: string | null,
) {
    if (!imagePath) {
        return;
    }

    const { error } = await supabaseAdmin.storage
        .from(SPONSORED_IMAGE_BUCKET)
        .remove([imagePath]);

    if (error) {
        console.error("Impossible de supprimer l'image sponsoring orpheline:", error);
    }
}

function extractAdminMetadata(payload: Record<string, unknown> | null) {
    const metadata: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(payload ?? {})) {
        if (key.startsWith("admin_")) {
            metadata[key] = value;
        }
    }

    return metadata;
}

function buildCampaignPayload(
    type: "artisan" | "sponsor",
    title: string,
    subtitle: string,
    payload: Record<string, unknown> | null,
    adminNote: string | null,
    adminStatus: string,
    userId: string,
) {
    const businessFields = type === "artisan"
        ? { name: title, profession: subtitle }
        : { brand_name: title, product_desc: subtitle };

    return {
        ...extractAdminMetadata(payload),
        ...businessFields,
        admin_status: adminStatus,
        admin_note: adminNote,
        admin_updated_at: new Date().toISOString(),
        admin_updated_by: userId,
        ...(payload?.admin_created_at ? { admin_created_at: payload.admin_created_at } : {}),
        ...(payload?.admin_created_by ? { admin_created_by: payload.admin_created_by } : {}),
    };
}

async function loadSponsoredItemForAction(supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>, itemId: string) {
    const { data, error } = await supabaseAdmin
        .from("sponsored_items")
        .select("id, type, payload, image_path, link, duration_seconds, start_at, end_at")
        .eq("id", itemId)
        .maybeSingle();

    if (error || !data) {
        throw new Error("Campagne introuvable");
    }

    return data as SponsoredItemActionRow;
}

function buildArtisanDisplayName(profile: {
    full_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
} | null | undefined, companyName?: string | null) {
    const fullName = profile?.full_name?.trim();
    if (fullName) {
        return fullName;
    }

    const composedName = [profile?.first_name, profile?.last_name]
        .map((value) => value?.trim())
        .filter(Boolean)
        .join(" ");

    if (composedName) {
        return composedName;
    }

    const normalizedCompany = companyName?.trim();
    return normalizedCompany || "Artisan";
}

export async function searchArtisansForAdmin(query: string): Promise<AdminArtisanSearchResult[]> {
    await requireAdminAccess("can_manage_sponsoring");

    const supabaseAdmin = createSupabaseAdminClientOrNull();
    if (!supabaseAdmin) {
        return [];
    }

    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
        return [];
    }

    const escapedQuery = normalizedQuery.replaceAll("%", "").replaceAll(",", " ");
    const ilikePattern = `%${escapedQuery}%`;

    const [{ data: profilesData }, { data: artisansData }] = await Promise.all([
        supabaseAdmin
            .from("profiles")
            .select("id, full_name, first_name, last_name")
            .eq("role", "artisan")
            .or(`full_name.ilike.${ilikePattern},first_name.ilike.${ilikePattern},last_name.ilike.${ilikePattern}`)
            .limit(8),
        supabaseAdmin
            .from("artisans")
            .select(`
                id,
                company_name,
                profession,
                profiles!inner (
                    full_name,
                    first_name,
                    last_name,
                    role
                )
            `)
            .eq("profiles.role", "artisan")
            .or(`profession.ilike.${ilikePattern},company_name.ilike.${ilikePattern}`)
            .limit(8),
    ]);

    const results = new Map<string, AdminArtisanSearchResult>();

    for (const profile of profilesData ?? []) {
        results.set(profile.id, {
            id: profile.id,
            fullName: buildArtisanDisplayName(profile),
            profession: null,
            companyName: null,
        });
    }

    for (const artisan of artisansData ?? []) {
        const profile = Array.isArray(artisan.profiles) ? artisan.profiles[0] : artisan.profiles;
        results.set(artisan.id, {
            id: artisan.id,
            fullName: buildArtisanDisplayName(profile, artisan.company_name),
            profession: artisan.profession ?? null,
            companyName: artisan.company_name ?? null,
        });
    }

    return Array.from(results.values()).slice(0, 8);
}

export async function getSponsoredItemsAdmin(): Promise<SponsoredItemAdminRow[]> {
    await requireAdminAccess("can_manage_sponsoring");

    const supabaseAdmin = createSupabaseAdminClientOrNull();
    if (!supabaseAdmin) {
        console.warn("[admin] SUPABASE_SERVICE_ROLE_KEY manquante: getSponsoredItemsAdmin retourne []");
        return [];
    }
    const { data, error } = await supabaseAdmin
        .from("sponsored_items")
        .select("id, type, payload, image_path, link, duration_seconds, start_at, end_at, created_at")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Erreur chargement sponsoring admin:", error);
        return [];
    }

    return (data ?? []) as SponsoredItemAdminRow[];
}

export async function saveSponsoredItem(formData: FormData) {
    const admin = await requireAdminAccess("can_manage_sponsoring");
    const supabaseAdmin = createSupabaseAdminClient();

    const itemId = normalizeFormString(formData.get("item_id"));
    const rawType = normalizeFormString(formData.get("type"));
    const type = rawType === "artisan" || rawType === "sponsor" ? rawType : null;
    const title = normalizeFormString(formData.get("title"));
    const subtitle = normalizeFormString(formData.get("subtitle"));
    const currentImagePath = parseNullableString(formData.get("image_path"));
    const link = parseNullableString(formData.get("link"));
    const startAtValue = normalizeFormString(formData.get("start_at"));
    const durationDays = parsePositiveInteger(formData.get("duration_days"), 7);
    const durationSeconds = parsePositiveInteger(formData.get("duration_seconds"), 20);
    const adminNote = parseNullableString(formData.get("admin_note"));
    const rawPriority = Number.parseInt(formData.get("priority")?.toString() ?? "", 10);
    const priority = Number.isInteger(rawPriority) && rawPriority >= 0 ? rawPriority : 0;

    if (!type) {
        throw new Error("Choisissez un type de campagne valide.");
    }

    if (!title) {
        throw new Error("Le titre de la campagne est obligatoire.");
    }

    if (!subtitle) {
        throw new Error("La description de la campagne est obligatoire.");
    }

    const startAt = parseLocalDateTime(startAtValue);
    const endAt = new Date(startAt.valueOf());
    endAt.setDate(endAt.getDate() + durationDays);

    const existingItem = itemId ? await loadSponsoredItemForAction(supabaseAdmin, itemId) : null;
    const currentStatus = existingItem
        ? normalizeSponsoredModerationStatus(existingItem.payload?.admin_status)
        : "active";
    const uploadedImagePath = await uploadSponsoredImage(supabaseAdmin, formData.get("image_file"));
    const imagePath = uploadedImagePath ?? currentImagePath;

    const payload = {
        ...buildCampaignPayload(
            type,
            title,
            subtitle,
            existingItem?.payload ?? null,
            adminNote,
            currentStatus,
            admin.user.id,
        ),
        priority,
    };

    const values = {
        type,
        payload,
        image_path: imagePath,
        link,
        duration_seconds: durationSeconds,
        start_at: startAt.toISOString(),
        end_at: endAt.toISOString(),
    };

    if (itemId) {
        const { error } = await supabaseAdmin
            .from("sponsored_items")
            .update(values)
            .eq("id", itemId);

        if (error) {
            await rollbackSponsoredImageUpload(supabaseAdmin, uploadedImagePath);
            throw new Error(`Impossible de mettre à jour la campagne: ${error.message}`);
        }
    } else {
        const { error } = await supabaseAdmin
            .from("sponsored_items")
            .insert({
                ...values,
                payload: {
                    ...payload,
                    admin_created_at: new Date().toISOString(),
                    admin_created_by: admin.user.id,
                },
            });

        if (error) {
            await rollbackSponsoredImageUpload(supabaseAdmin, uploadedImagePath);
            throw new Error(`Impossible de créer la campagne: ${error.message}`);
        }
    }

    await appendAdminAuditLog({
        admin,
        action: itemId ? "sponsored_item_updated" : "sponsored_item_created",
        payload: {
            item_id: itemId || null,
            type,
            title,
            subtitle,
            link,
            image_path: imagePath,
            duration_days: durationDays,
            duration_seconds: durationSeconds,
            start_at: startAt.toISOString(),
            end_at: endAt.toISOString(),
            priority,
            admin_note: adminNote,
        },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/sponsoring");
    revalidatePath("/");
    return;
}

export async function pauseSponsoredItem(itemId: string, note?: string) {
    const admin = await requireAdminAccess("can_manage_sponsoring");
    const supabaseAdmin = createSupabaseAdminClient();
    const item = await loadSponsoredItemForAction(supabaseAdmin, itemId);
    const currentStatus = normalizeSponsoredModerationStatus(item.payload?.admin_status);

    if (currentStatus === "terminated") {
        throw new Error("Cette campagne est déjà terminée");
    }

    const patch: Record<string, unknown> = {
        admin_status: "paused",
        admin_paused_at: new Date().toISOString(),
    };

    const adminNote = normalizeAdminNote(note);
    if (adminNote) {
        patch.admin_note = adminNote;
    }

    const { error } = await supabaseAdmin
        .from("sponsored_items")
        .update({
            payload: buildPayloadPatch(item.payload, patch),
        })
        .eq("id", itemId);

    if (error) {
        throw new Error(`Impossible de suspendre la campagne: ${error.message}`);
    }

    await appendAdminAuditLog({
        admin,
        action: "sponsored_item_paused",
        payload: {
            item_id: itemId,
            previous_status: currentStatus,
            note: adminNote,
        },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/sponsoring");
    revalidatePath("/");
    return { success: true };
}

export async function resumeSponsoredItem(itemId: string, note?: string) {
    const admin = await requireAdminAccess("can_manage_sponsoring");
    const supabaseAdmin = createSupabaseAdminClient();
    const item = await loadSponsoredItemForAction(supabaseAdmin, itemId);
    const currentStatus = normalizeSponsoredModerationStatus(item.payload?.admin_status);

    if (currentStatus === "terminated") {
        throw new Error("Cette campagne est déjà terminée");
    }

    if (currentStatus !== "paused") {
        throw new Error("Cette campagne n'est pas suspendue");
    }

    const pausedAtValue = readPayloadString(item.payload, "admin_paused_at");
    const pausedAtMs = pausedAtValue ? new Date(pausedAtValue).valueOf() : Number.NaN;
    const pauseDurationMs = Number.isFinite(pausedAtMs) ? Math.max(0, Date.now() - pausedAtMs) : 0;
    const nextEndAt = new Date(new Date(item.end_at).valueOf() + pauseDurationMs);

    const patch: Record<string, unknown> = {
        admin_status: "active",
        admin_resumed_at: new Date().toISOString(),
        admin_paused_at: null,
    };

    const adminNote = normalizeAdminNote(note);
    if (adminNote) {
        patch.admin_note = adminNote;
    }

    const { error } = await supabaseAdmin
        .from("sponsored_items")
        .update({
            end_at: nextEndAt.toISOString(),
            payload: buildPayloadPatch(item.payload, patch),
        })
        .eq("id", itemId);

    if (error) {
        throw new Error(`Impossible de reprendre la campagne: ${error.message}`);
    }

    await appendAdminAuditLog({
        admin,
        action: "sponsored_item_resumed",
        payload: {
            item_id: itemId,
            previous_status: currentStatus,
            note: adminNote,
            end_at: nextEndAt.toISOString(),
        },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/sponsoring");
    revalidatePath("/");
    return { success: true, end_at: nextEndAt.toISOString() };
}

export async function prolongSponsoredItem(itemId: string, extraDays: number, note?: string) {
    const admin = await requireAdminAccess("can_manage_sponsoring");

    if (!Number.isInteger(extraDays) || extraDays <= 0) {
        throw new Error("La prolongation doit être exprimée en jours positifs.");
    }

    const supabaseAdmin = createSupabaseAdminClient();
    const item = await loadSponsoredItemForAction(supabaseAdmin, itemId);
    const currentStatus = normalizeSponsoredModerationStatus(item.payload?.admin_status);

    if (currentStatus === "terminated") {
        throw new Error("Cette campagne est déjà terminée");
    }

    const nowMs = Date.now();
    const baseEndMs = Math.max(new Date(item.end_at).valueOf(), nowMs);
    const nextEndAt = new Date(baseEndMs);
    nextEndAt.setDate(nextEndAt.getDate() + extraDays);

    const patch: Record<string, unknown> = {
        admin_status: currentStatus,
    };

    const adminNote = normalizeAdminNote(note);
    if (adminNote) {
        patch.admin_note = adminNote;
    }

    if (currentStatus === "paused") {
        patch.admin_paused_at = item.payload?.admin_paused_at ?? new Date().toISOString();
    }

    const { error } = await supabaseAdmin
        .from("sponsored_items")
        .update({
            end_at: nextEndAt.toISOString(),
            payload: buildPayloadPatch(item.payload, patch),
        })
        .eq("id", itemId);

    if (error) {
        throw new Error(`Impossible de prolonger la campagne: ${error.message}`);
    }

    await appendAdminAuditLog({
        admin,
        action: "sponsored_item_prolonged",
        payload: {
            item_id: itemId,
            previous_status: currentStatus,
            note: adminNote,
            extra_days: extraDays,
            end_at: nextEndAt.toISOString(),
        },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/sponsoring");
    revalidatePath("/");
    return { success: true, end_at: nextEndAt.toISOString() };
}

export async function terminateSponsoredItem(itemId: string, note?: string) {
    const admin = await requireAdminAccess("can_manage_sponsoring");
    const supabaseAdmin = createSupabaseAdminClient();
    const item = await loadSponsoredItemForAction(supabaseAdmin, itemId);

    const patch: Record<string, unknown> = {
        admin_status: "terminated",
        admin_terminated_at: new Date().toISOString(),
    };

    const adminNote = normalizeAdminNote(note);
    if (adminNote) {
        patch.admin_note = adminNote;
    }

    const { error } = await supabaseAdmin
        .from("sponsored_items")
        .update({
            end_at: new Date().toISOString(),
            payload: buildPayloadPatch(item.payload, patch),
        })
        .eq("id", itemId);

    if (error) {
        throw new Error(`Impossible de terminer la campagne: ${error.message}`);
    }

    await appendAdminAuditLog({
        admin,
        action: "sponsored_item_terminated",
        payload: {
            item_id: itemId,
            note: adminNote,
        },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/sponsoring");
    revalidatePath("/");
    return { success: true };
}
