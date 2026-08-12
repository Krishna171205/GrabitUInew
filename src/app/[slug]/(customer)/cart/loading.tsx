export default function Loading() {
  return (
    <div className="min-h-screen bg-surface animate-pulse">
      <div className="h-16 bg-surface border-b border-zinc-100" />
      {/* cart items */}
      <div className="px-4 mt-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-zinc-100 rounded-2xl" />
        ))}
      </div>
      {/* slot picker label */}
      <div className="h-5 w-36 bg-zinc-100 rounded-full mx-4 mt-6 mb-3" />
      {/* slot grid */}
      <div className="px-4 grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-12 bg-zinc-100 rounded-xl" />
        ))}
      </div>
      {/* place order footer */}
      <div className="mx-4 mt-8 h-14 bg-zinc-100 rounded-full" />
    </div>
  )
}
