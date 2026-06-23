export default function Loading() {
  return (
    <div className="min-h-screen bg-surface animate-pulse">
      <div className="h-16 bg-surface border-b border-zinc-100" />
      {/* order summary card */}
      <div className="mx-4 mt-4 rounded-3xl bg-zinc-100 p-5 space-y-3">
        <div className="h-4 w-24 bg-zinc-200 rounded-full" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-32 bg-zinc-200 rounded-full" />
            <div className="h-4 w-16 bg-zinc-200 rounded-full" />
          </div>
        ))}
        <div className="border-t border-zinc-200 pt-3 flex justify-between">
          <div className="h-5 w-16 bg-zinc-200 rounded-full" />
          <div className="h-5 w-20 bg-zinc-200 rounded-full" />
        </div>
      </div>
      {/* payment options */}
      <div className="mx-4 mt-4 space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 bg-zinc-100 rounded-2xl" />
        ))}
      </div>
      {/* pay button */}
      <div className="mx-4 mt-6 h-14 bg-zinc-100 rounded-full" />
    </div>
  )
}
