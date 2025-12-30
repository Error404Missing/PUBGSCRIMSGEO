export default function LoadingResults() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 animate-pulse">
        <div className="h-8 w-56 bg-zinc-800 rounded" />
        <div className="h-4 w-80 bg-zinc-800 rounded" />
      </div>
      <div className="space-y-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-zinc-900/50 border-zinc-800 rounded-lg overflow-hidden animate-pulse">
            <div className="h-12 bg-zinc-800" />
            <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="space-y-3">
                  <div className="aspect-video bg-zinc-800 rounded-lg" />
                  <div className="h-3 w-3/4 bg-zinc-800 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
