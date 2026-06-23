'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-6 text-center pb-20">
      <div className="text-4xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold text-zinc-800 mb-2">Something went wrong</h2>
      <p className="text-sm text-zinc-500 mb-6 max-w-xs">
        {error.message || 'Could not load this section. Try again.'}
      </p>
      <button
        onClick={reset}
        className="bg-primary text-white px-6 py-3 rounded-full font-bold text-sm"
      >
        Try again
      </button>
    </div>
  )
}
