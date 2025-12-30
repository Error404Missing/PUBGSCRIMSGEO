export default function LoadingSchedule() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 animate-pulse">
        <div className="h-8 w-56 bg-zinc-800 rounded" />
        <div className="h-4 w-96 bg-zinc-800 rounded" />
      </div>
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 animate-pulse">
            <div className="h-4 w-48 bg-zinc-800 rounded mb-3" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, j) => (
                <div key={j} className="h-12 bg-zinc-800 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
