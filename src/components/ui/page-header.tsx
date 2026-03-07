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
    <header className="glass-panel panel-ring rounded-[32px] border border-white/8 px-6 py-6 sm:px-8">
      <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent-secondary)]">
        {eyebrow}
      </p>
      <div className="mt-4 grid gap-6 xl:grid-cols-[1.4fr_0.9fr] xl:items-end">
        <div>
          <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
            {description}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {meta.map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-white/8 bg-black/10 p-4"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                {item.label}
              </p>
              <p className="mt-2 text-sm font-medium text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
