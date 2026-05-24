export default function SkeletonCards() {
  return (
    <div className="flex flex-col gap-6">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-8 space-y-5 animate-pulse"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
              <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-700 rounded-xl" />
              <div className="h-3 w-32 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
            </div>
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800" />
          </div>

          {/* Badges */}
          <div className="flex gap-2">
            <div className="h-7 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
            <div className="h-7 w-32 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-50 dark:border-zinc-800">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 space-y-2">
                <div className="h-2.5 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
                <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                <div className="h-3 w-3/4 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
