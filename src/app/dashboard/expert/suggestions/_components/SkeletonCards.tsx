export default function SkeletonCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex flex-col relative animate-pulse"
        >
          {/* Shimmer Effect */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent z-10" />

          {/* Thumbnail Placeholder */}
          <div className="h-48 w-full bg-zinc-100 dark:bg-zinc-800 relative">
            <div className="absolute top-3 left-3 h-6 w-20 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
            <div className="absolute top-3 right-3 h-6 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
          </div>

          {/* Content Placeholder */}
          <div className="p-5 flex-1 flex flex-col">
            <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded-lg mb-3" />
            <div className="space-y-2 mb-6">
              <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded" />
              <div className="h-4 w-5/6 bg-zinc-100 dark:bg-zinc-800 rounded" />
            </div>

            <div className="grid grid-cols-2 gap-y-3 mb-6">
              <div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800 rounded col-span-2" />
              <div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800 rounded col-span-2" />
            </div>

            <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded mb-6" />

            <div className="mt-auto h-11 w-full bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
