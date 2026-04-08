export default function SupportLoading() {
  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[#050607] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.1),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.04),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative hidden w-[320px] flex-col border-r border-white/10 bg-black/45 p-4 lg:flex xl:w-[340px]">
        <div className="h-36 rounded-[28px] border border-white/10 bg-white/[0.04] animate-pulse" />
        <div className="mt-4 space-y-3">
          <div className="h-28 rounded-[24px] border border-white/10 bg-white/[0.03] animate-pulse" />
          <div className="h-28 rounded-[24px] border border-white/10 bg-white/[0.03] animate-pulse" />
          <div className="h-28 rounded-[24px] border border-white/10 bg-white/[0.03] animate-pulse" />
          <div className="h-28 rounded-[24px] border border-white/10 bg-white/[0.03] animate-pulse" />
        </div>
      </div>

      <div className="relative flex flex-1 min-h-0">
        <div className="flex flex-1 flex-col px-5 py-6 sm:px-6 lg:px-8">
          <div className="h-40 rounded-[30px] border border-white/10 bg-white/[0.03] animate-pulse" />
          <div className="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[#0c0d0f]/85">
            <div className="h-28 border-b border-white/10 bg-white/[0.03] animate-pulse" />
            <div className="flex-1 space-y-6 px-6 py-6">
              <div className="ml-auto h-20 w-64 rounded-[22px] border border-cyan-300/20 bg-cyan-300/10 animate-pulse" />
              <div className="h-24 w-72 rounded-[22px] border border-white/10 bg-white/[0.04] animate-pulse" />
              <div className="ml-auto h-24 w-80 rounded-[22px] border border-cyan-300/20 bg-cyan-300/10 animate-pulse" />
            </div>
            <div className="h-28 border-t border-white/10 bg-black/60 px-4 py-4">
              <div className="h-full rounded-[20px] border border-white/10 bg-white/[0.04] animate-pulse" />
            </div>
          </div>
        </div>

        <div className="hidden w-80 flex-col border-l border-white/10 bg-black/45 p-5 lg:flex">
          <div className="h-56 rounded-[28px] border border-white/10 bg-white/[0.04] animate-pulse" />
          <div className="mt-6 h-48 rounded-[24px] border border-white/10 bg-white/[0.03] animate-pulse" />
          <div className="mt-6 h-24 rounded-[22px] border border-white/10 bg-white/[0.03] animate-pulse" />
          <div className="mt-4 h-24 rounded-[22px] border border-white/10 bg-white/[0.03] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
