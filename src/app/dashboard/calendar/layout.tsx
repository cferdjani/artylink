import { redirect } from "next/navigation";

export default function CalendarLayout() {
    redirect("/dashboard/services?tab=planning");
}
