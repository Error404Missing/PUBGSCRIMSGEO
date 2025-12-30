export default function LoadingHelp() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 animate-pulse">
        <div className="h-8 w-64 bg-zinc-800 rounded" />
        <div className="h-4 w-80 bg-zinc-800 rounded" />
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-zinc-900/50 border-zinc-800 rounded-lg p-6 animate-pulse">
              <div className="h-4 w-40 bg-zinc-800 rounded mb-3" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-zinc-800 rounded" />
                <div className="h-3 w-5/6 bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-zinc-900/50 border-zinc-800 rounded-lg p-4 animate-pulse">
              <div className="h-4 w-56 bg-zinc-800 rounded mb-2" />
              <div className="h-3 w-full bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
