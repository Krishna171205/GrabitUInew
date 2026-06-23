export default function Loading() {
  return (
    <div className="min-h-screen bg-surface animate-pulse">
      <div className="h-16 bg-surface border-b border-zinc-100" />
      {/* status badge */}
      <div className="flex flex-col items-center mt-8 mb-6">
        <div className="h-16 w-16 bg-zinc-100 rounded-full" />
        <div className="h-5 w-32 bg-zinc-100 rounded-full mt-3" />
        <div className="h-4 w-48 bg-zinc-100 rounded-full mt-2" />
      </div>
      {/* timeline */}
      <div className="mx-4 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="h-6 w-6 bg-zinc-100 rounded-full flex-shrink-0 mt-1" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-28 bg-zinc-100 rounded-full" />
              <div className="h-3 w-20 bg-zinc-100 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      {/* order items card */}
      <div className="mx-4 mt-6 rounded-3xl bg-zinc-100 h-32" />
    </div>
  )
}
