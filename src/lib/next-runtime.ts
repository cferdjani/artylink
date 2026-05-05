export function isExpectedDynamicServerUsageError(error: unknown) {
    if (!error || typeof error !== "object") {
        return false;
    }

    const candidate = error as { digest?: unknown; description?: unknown; message?: unknown };

    return (
        candidate.digest === "DYNAMIC_SERVER_USAGE" ||
        (typeof candidate.description === "string" && candidate.description.includes("Dynamic server usage")) ||
        (typeof candidate.message === "string" && candidate.message.includes("Dynamic server usage"))
    );
}
