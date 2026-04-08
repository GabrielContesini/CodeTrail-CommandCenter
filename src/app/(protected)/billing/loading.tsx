export default function BillingLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <div className="h-8 w-64 bg-neutral-800 rounded animate-pulse mb-3"></div>
          <div className="h-4 w-96 bg-neutral-800 rounded animate-pulse"></div>
        </div>
        <div className="h-20 w-full max-w-xl bg-neutral-800/50 rounded-xl animate-pulse"></div>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[var(--bg-surface-low)] rounded-xl p-6 border border-neutral-800 animate-pulse">
            <div className="h-3 w-32 bg-neutral-800 rounded mb-6"></div>
            <div className="flex justify-between items-end">
              <div className="h-8 w-24 bg-neutral-800 rounded"></div>
              <div className="h-5 w-16 bg-neutral-800 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Revenue Trends */}
        <div className="col-span-12 xl:col-span-8 bg-[var(--bg-surface-low)] rounded-xl border border-neutral-800 p-6 flex flex-col h-80 animate-pulse">
           <div className="flex justify-between items-start mb-6 w-full">
            <div>
              <div className="h-5 w-48 bg-neutral-800 rounded mb-2"></div>
              <div className="h-3 w-32 bg-neutral-800 rounded"></div>
            </div>
          </div>
          <div className="flex-1 w-full bg-neutral-800/30 rounded-lg"></div>
        </div>

        {/* Plan distribution */}
        <div className="col-span-12 xl:col-span-4 bg-[var(--bg-surface-low)] rounded-xl border border-neutral-800 p-6 flex flex-col h-80 animate-pulse">
           <div className="h-5 w-32 bg-neutral-800 rounded mb-8"></div>
           <div className="flex-1 flex justify-center items-center">
              <div className="w-48 h-48 rounded-full border-[12px] border-neutral-800"></div>
           </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-surface-low)] rounded-xl border border-neutral-800 overflow-hidden h-64 animate-pulse">
         <div className="p-6 border-b border-neutral-800 flex justify-between">
           <div className="h-5 w-48 bg-neutral-800 rounded"></div>
           <div className="h-4 w-24 bg-neutral-800 rounded"></div>
         </div>
         <div className="p-6 space-y-4">
            <div className="h-8 w-full bg-neutral-800/50 rounded"></div>
            <div className="h-8 w-full bg-neutral-800/50 rounded"></div>
            <div className="h-8 w-full bg-neutral-800/50 rounded"></div>
         </div>
      </div>
    </div>
  );
}
