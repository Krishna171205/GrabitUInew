export default function Loading() {
  return (
    <div className="min-h-screen bg-surface animate-pulse">
      <div className="h-16 bg-surface border-b border-zinc-100" />
      <div className="h-48 bg-zinc-100 mx-4 mt-4 rounded-3xl" />
      <div className="px-4 mt-6 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-zinc-100 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
