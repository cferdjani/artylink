import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const supabase = await createSupabaseServerClient();

        // Exécute notre fonction SQL "Shuffle Bag" pour remélanger les artisans "Pro"
        const { error } = await supabase.rpc("refresh_premium_pool");

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Le carrousel Premium a été remélangé avec succès !" });
    } catch (error: any) {
        console.error("Erreur lors du CRON de remélange :", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
