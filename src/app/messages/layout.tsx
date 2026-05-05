import { ReactNode } from "react";

export default function MessagesLayout({
    children,
}: {
    children: ReactNode;
}) {
    return <div className="mx-auto w-full max-w-[1320px] px-4 md:px-8 py-8">{children}</div>;
}
