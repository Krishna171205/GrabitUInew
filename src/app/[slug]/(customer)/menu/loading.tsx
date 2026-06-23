export default function Loading() {
  return (
    <div className="min-h-screen bg-surface animate-pulse">
      <div className="h-16 bg-surface border-b border-zinc-100" />
      {/* category pills */}
      <div className="flex gap-2 px-4 py-3 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-20 bg-zinc-100 rounded-full flex-shrink-0" />
        ))}
      </div>
      {/* section header */}
      <div className="h-5 w-28 bg-zinc-100 rounded-full mx-4 mt-2 mb-3" />
      {/* item list */}
      <div className="px-4 space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-24 bg-zinc-100 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
