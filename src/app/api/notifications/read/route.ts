import { markNotificationAsRead } from "@/lib/actions/notifications";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { id } = await request.json();
        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await markNotificationAsRead(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}