export default function DashboardLoading() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 space-y-8 animate-pulse">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3 w-full max-w-md">
                    <div className="h-6 w-32 rounded-full bg-slate-200/60" />
                    <div className="h-10 w-64 rounded-xl bg-slate-200/60 mt-4" />
                    <div className="h-4 w-full rounded-md bg-slate-200/60 mt-2" />
                    <div className="h-4 w-2/3 rounded-md bg-slate-200/60" />
                </div>
                <div className="h-12 w-48 rounded-xl bg-slate-200/60" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="h-32 rounded-2xl bg-white/50 border border-white/60" />
                <div className="h-32 rounded-2xl bg-white/50 border border-white/60" />
                <div className="h-32 rounded-2xl bg-white/50 border border-white/60" />
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/40 p-6 md:p-7 min-h-[400px]">
                <div className="h-8 w-48 rounded-xl bg-slate-200/60 mb-6" />
                <div className="space-y-4">
                    <div className="h-24 w-full rounded-xl bg-white/50 border border-slate-200/40" />
                    <div className="h-24 w-full rounded-xl bg-white/50 border border-slate-200/40" />
                    <div className="h-24 w-full rounded-xl bg-white/50 border border-slate-200/40" />
                </div>
            </div>
        </div>
    );
}
