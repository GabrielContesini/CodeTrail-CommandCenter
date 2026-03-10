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
    <header className="oled-panel flex flex-col justify-between rounded-[20px] px-6 py-6 sm:px-8">
      <div>
        <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-[var(--primary)]">
          {eyebrow}
        </p>
        <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] xl:items-center">
          <div>
            <h1 className="max-w-4xl text-[1.8rem] font-bold leading-[1.1] tracking-tight text-white sm:text-[2.2rem]">
              {title}
            </h1>
            <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-[var(--text-secondary)]">
              {description}
            </p>
          </div>

          {meta.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {meta.map((item) => (
                <div
                  key={item.label}
                  className="flex min-h-[88px] flex-col justify-between rounded-[16px] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 transition-colors hover:border-[rgba(255,255,255,0.15)]"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    {item.label}
                  </p>
                  <p className="data-value mt-2 text-[15px] font-semibold text-white tracking-tight">{item.value}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
