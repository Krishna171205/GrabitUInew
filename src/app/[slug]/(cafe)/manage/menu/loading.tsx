export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-50 animate-pulse pb-20">
      <div className="h-14 bg-white border-b border-zinc-100 flex items-center justify-between px-4">
        <div className="h-5 w-28 bg-zinc-200 rounded-full" />
        <div className="h-9 w-24 bg-zinc-200 rounded-full" />
      </div>
      {/* category tabs */}
      <div className="flex gap-2 px-4 py-3 bg-white border-b border-zinc-100">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-20 bg-zinc-100 rounded-full" />
        ))}
      </div>
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-20 bg-white rounded-2xl border border-zinc-100 flex items-center px-4 gap-3">
            <div className="h-12 w-12 bg-zinc-100 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-zinc-100 rounded-full" />
              <div className="h-3 w-16 bg-zinc-100 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
