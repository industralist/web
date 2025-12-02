// Loading skeleton component for wallet data
// Displays shimmer effect while data is being fetched

export function WalletDataSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Portfolio section skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="rounded-lg p-6 md:p-8 border border-slate-700" style={{ backgroundColor: "rgb(20, 15, 12)" }}>
          <div className="h-4 bg-slate-700 rounded w-24 mb-4" />
          <div className="h-12 bg-slate-700 rounded w-40 mb-4" />
          <div className="h-6 bg-slate-700 rounded w-32" />
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-lg p-3 md:p-4 border border-slate-700"
              style={{ backgroundColor: "rgb(20, 15, 12)" }}
            >
              <div className="h-3 bg-slate-700 rounded w-16 mb-2" />
              <div className="h-5 bg-slate-700 rounded w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Token holdings skeleton */}
      <div className="rounded-lg p-4 md:p-6 border border-slate-700" style={{ backgroundColor: "rgb(20, 15, 12)" }}>
        <div className="h-6 bg-slate-700 rounded w-32 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-slate-700 rounded w-full" />
              <div className="h-2 bg-slate-700 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
