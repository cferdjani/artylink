export default function SearchLoading() {
    return (
        <div className="mx-auto mt-6 w-full max-w-[1320px] px-4 md:px-8 xl:px-12 pb-24 animate-pulse">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start pt-6">
                {/* Refined Filters Skeleton */}
                <div className="w-full lg:w-[280px] xl:w-[320px] shrink-0 sticky top-24">
                    <div className="rounded-3xl border border-white/60 bg-white/40 p-6 shadow-sm backdrop-blur-xl">
                        <div className="h-6 w-32 rounded-lg bg-slate-200/60 mb-6" />
                        <div className="space-y-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="space-y-3">
                                    <div className="h-4 w-24 rounded-md bg-slate-200/60" />
                                    <div className="h-10 w-full rounded-xl bg-white/60 border border-slate-200/40" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="h-8 w-64 rounded-xl bg-slate-200/60" />
                        <div className="h-10 w-32 rounded-xl bg-slate-200/60" />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="rounded-3xl border border-white/60 bg-white/40 p-5 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="h-16 w-16 rounded-2xl bg-slate-200/60 shrink-0" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-5 w-3/4 rounded-md bg-slate-200/60" />
                                        <div className="h-4 w-1/2 rounded-md bg-slate-200/60" />
                                    </div>
                                </div>
                                <div className="mt-4 space-y-2">
                                    <div className="h-4 w-full rounded-md bg-slate-200/60" />
                                    <div className="h-4 w-5/6 rounded-md bg-slate-200/60" />
                                </div>
                                <div className="mt-6 flex justify-between items-center">
                                    <div className="h-6 w-20 rounded-full bg-slate-200/60" />
                                    <div className="h-8 w-8 rounded-full bg-slate-200/60" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
