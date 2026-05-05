export default function AdminLoading() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="apple-panel p-6 md:p-8 border-white/10 bg-white/5">
                <div className="h-6 w-32 rounded-full bg-slate-700/50 mb-3" />
                <div className="h-10 w-64 rounded-xl bg-slate-700/50 mb-4" />
                <div className="h-4 w-3/4 max-w-2xl rounded-md bg-slate-700/30" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="h-32 rounded-2xl bg-white/5 border border-white/10 p-6">
                    <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-700/50 shrink-0" />
                        <div className="space-y-2 w-full">
                            <div className="h-4 w-20 rounded-md bg-slate-700/50" />
                            <div className="h-8 w-12 rounded-lg bg-slate-700/50" />
                        </div>
                    </div>
                </div>
                <div className="h-32 rounded-2xl bg-white/5 border border-white/10 p-6">
                    <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-700/50 shrink-0" />
                        <div className="space-y-2 w-full">
                            <div className="h-4 w-20 rounded-md bg-slate-700/50" />
                            <div className="h-8 w-12 rounded-lg bg-slate-700/50" />
                        </div>
                    </div>
                </div>
                <div className="h-32 rounded-2xl bg-white/5 border border-white/10 p-6">
                    <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-700/50 shrink-0" />
                        <div className="space-y-2 w-full">
                            <div className="h-4 w-20 rounded-md bg-slate-700/50" />
                            <div className="h-8 w-12 rounded-lg bg-slate-700/50" />
                        </div>
                    </div>
                </div>
                <div className="h-32 rounded-2xl bg-white/5 border border-white/10 p-6">
                    <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-700/50 shrink-0" />
                        <div className="space-y-2 w-full">
                            <div className="h-4 w-20 rounded-md bg-slate-700/50" />
                            <div className="h-8 w-12 rounded-lg bg-slate-700/50" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-64 rounded-2xl bg-white/5 border border-white/10 p-8">
                <div className="h-6 w-48 rounded-xl bg-slate-700/50 mb-4" />
                <div className="space-y-3">
                    <div className="h-4 w-full rounded-md bg-slate-700/30" />
                    <div className="h-4 w-full rounded-md bg-slate-700/30" />
                    <div className="h-4 w-2/3 rounded-md bg-slate-700/30" />
                </div>
            </div>
        </div>
    );
}
