export default function DatabaseLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <div className="h-10 w-96 bg-neutral-900/80 rounded-lg mb-3"></div>
          <div className="h-4 w-72 bg-neutral-900/60 rounded-lg"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-48 bg-neutral-900/60 rounded-lg border border-neutral-800/50"></div>
          <div className="h-10 w-36 bg-neutral-900/60 rounded-lg border border-neutral-800/50"></div>
        </div>
      </header>

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="h-32 bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
        <div className="h-32 bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
        <div className="h-32 bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
        <div className="h-32 bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 h-80 bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
        <div className="col-span-12 lg:col-span-4 h-80 bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>

        <div className="col-span-12 lg:col-span-7 h-[460px] bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
        <div className="col-span-12 lg:col-span-5 h-[460px] bg-neutral-900/60 rounded-xl border border-neutral-800/50 shadow-inner"></div>
      </div>
    </div>
  )
}
