import { markAllNotificationsAsRead } from "@/lib/actions/notifications";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        await markAllNotificationsAsRead();
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}