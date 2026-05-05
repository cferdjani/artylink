export function PremiumMarqueeSkeleton() {
    const skeletonItem = (
        <div className="w-[260px] h-[60px] rounded-2xl p-2 pr-4 flex-shrink-0 bg-slate-800/80 border border-white/10 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-slate-700 flex-shrink-0"></div>
            <div className="min-w-0 flex-1">
                <div className="h-4 w-3/4 rounded bg-slate-700"></div>
                <div className="h-3 w-1/2 rounded bg-slate-700 mt-2"></div>
            </div>
        </div>
    );

    return (
        <section className="relative flex overflow-hidden w-full py-2 group bg-transparent border-none">
            <div
                className="relative w-full overflow-hidden"
                style={{
                    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 10%, #000 90%, transparent 100%)',
                    maskImage: 'linear-gradient(to right, transparent 0%, #000 10%, #000 90%, transparent 100%)',
                }}
            >
                <div className="flex w-max items-center gap-4 animate-pulse">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex-shrink-0">{skeletonItem}</div>
                    ))}
                </div>
            </div>
        </section>
    );
}