export default function LoadingContact() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 animate-pulse">
        <div className="h-8 w-48 bg-zinc-800 rounded" />
        <div className="h-4 w-72 bg-zinc-800 rounded" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-zinc-900/50 border-zinc-800 rounded-lg p-6 animate-pulse">
            <div className="h-16 w-16 bg-zinc-800 rounded-full mx-auto mb-4" />
            <div className="h-4 w-32 bg-zinc-800 rounded mx-auto" />
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full bg-zinc-800 rounded" />
              <div className="h-3 w-3/4 bg-zinc-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
