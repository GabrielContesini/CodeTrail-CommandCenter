export default function ProtectedLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="h-10 w-72 bg-neutral-900/80 rounded-lg mb-3"></div>
          <div className="h-4 w-96 bg-neutral-900/60 rounded-lg"></div>
        </div>
        <div className="flex gap-4">
          <div className="h-10 w-36 bg-neutral-900/60 rounded-lg"></div>
          <div className="h-10 w-32 bg-neutral-900/60 rounded-lg"></div>
        </div>
      </section>
      
      {/* Bento Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 h-[320px] bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
        <div className="md:col-span-5 h-[320px] bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
        <div className="md:col-span-3 h-[320px] bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
        <div className="md:col-span-8 h-[400px] bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
        <div className="md:col-span-4 space-y-4">
           <div className="h-32 bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
           <div className="h-60 bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
        </div>
      </div>
    </div>
  )
}
