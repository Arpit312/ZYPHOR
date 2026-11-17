export default function Loading() {
  return (
    <div className="min-h-[70vh] w-full bg-paper">
      {/* Top micro progress indicator */}
      <div className="fixed top-0 left-0 right-0 h-[2.5px] z-50 overflow-hidden bg-transparent">
        <div className="h-full bg-gradient-to-r from-coral via-amber-400 to-coral w-full animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="space-y-3 text-center max-w-xl mx-auto">
          <div className="h-5 bg-black/[0.06] rounded-full w-28 mx-auto" />
          <div className="h-10 bg-black/[0.08] rounded-xl w-3/4 mx-auto" />
          <div className="h-4 bg-black/[0.04] rounded-lg w-1/2 mx-auto" />
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-black/[0.06] shadow-sm space-y-4">
              <div className="aspect-[4/3] bg-black/[0.04] rounded-xl" />
              <div className="space-y-2">
                <div className="h-4 bg-black/[0.08] rounded w-4/5" />
                <div className="h-3 bg-black/[0.04] rounded w-2/5" />
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-black/[0.04]">
                <div className="h-5 bg-black/[0.08] rounded w-1/3" />
                <div className="h-4 bg-coral/20 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
