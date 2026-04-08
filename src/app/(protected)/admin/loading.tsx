export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="h-10 w-80 bg-neutral-900/80 rounded-lg mb-3"></div>
          <div className="h-4 w-96 bg-neutral-900/60 rounded-lg"></div>
        </div>
      </section>
      
      {/* Config Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        <div className="md:col-span-4 h-48 bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
        <div className="md:col-span-4 h-48 bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
        <div className="md:col-span-4 h-48 bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
      </div>
      
      {/* Table Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
         <div className="md:col-span-9 h-[600px] w-full bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
         <div className="md:col-span-3 space-y-6">
           <div className="h-64 bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
           <div className="h-64 bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
         </div>
      </div>
    </div>
  )
}
