export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-50 animate-pulse pb-20">
      <div className="h-14 bg-white border-b border-zinc-100 flex items-center px-4">
        <div className="h-5 w-32 bg-zinc-200 rounded-full" />
      </div>
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white rounded-2xl border border-zinc-100" />
        ))}
      </div>
    </div>
  )
}
