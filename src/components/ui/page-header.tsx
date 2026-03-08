type MetaItem = {
  label: string;
  value: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  meta = [],
}: {
  eyebrow: string;
  title: string;
  description: string;
  meta?: MetaItem[];
}) {
  return (
    <header className="glass-panel panel-ring rounded-[28px] border border-white/8 px-5 py-5 sm:px-7">
      <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent-secondary)]">
        {eyebrow}
      </p>
      <div className="mt-3 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] xl:items-center">
        <div>
          <h1 className="max-w-4xl text-[2rem] font-semibold leading-tight tracking-tight text-white sm:text-[2.5rem]">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-secondary)] sm:text-[15px]">
            {description}
          </p>
        </div>

        {meta.length ? (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {meta.map((item) => (
              <div
                key={item.label}
                className="flex min-h-[88px] flex-col justify-between rounded-[22px] border border-white/8 bg-black/10 p-3.5"
              >
                <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                  {item.label}
                </p>
                <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
}
