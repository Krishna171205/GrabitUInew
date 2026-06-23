export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-50 animate-pulse pb-20">
      <div className="h-14 bg-white border-b border-zinc-100 flex items-center px-4">
        <div className="h-5 w-36 bg-zinc-200 rounded-full" />
      </div>
      {/* filter tabs */}
      <div className="flex gap-2 px-4 py-3 bg-white border-b border-zinc-100">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 w-20 bg-zinc-100 rounded-full" />
        ))}
      </div>
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 bg-white rounded-2xl border border-zinc-100" />
        ))}
      </div>
    </div>
  )
}
