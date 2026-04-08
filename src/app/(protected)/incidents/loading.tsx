export default function IncidentsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="h-10 w-[420px] bg-neutral-900/80 rounded-lg mb-3"></div>
          <div className="h-4 w-80 bg-neutral-900/60 rounded-lg"></div>
        </div>
      </section>
      
      {/* Top Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
         <div className="h-32 bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
         <div className="h-32 bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
         <div className="h-32 bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
         <div className="h-32 bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
      </div>
      
      {/* List and Side Panel Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 flex flex-col gap-4">
           {/* Filtering Bar */}
           <div className="h-14 bg-neutral-900/60 rounded-lg border border-neutral-800/50"></div>
           {/* Incident Cards */}
           <div className="h-28 bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
           <div className="h-28 bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
           <div className="h-28 bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
           <div className="h-28 bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
        </div>
        <div className="md:col-span-4 space-y-4">
           {/* Side Map/Tracker */}
           <div className="h-[400px] bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
           <div className="h-64 bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
        </div>
      </div>
    </div>
  )
}
