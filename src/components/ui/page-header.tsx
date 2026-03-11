type MetaItem = {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warning" | "critical";
};

const metaToneConfig = {
  neutral: "border-[var(--border-subtle)] bg-[var(--bg-inset)] text-[var(--text-primary)]",
  good:    "border-[var(--status-green-border)] bg-[var(--status-green-bg)] text-[var(--text-primary)]",
  warning: "border-[var(--status-yellow-border)] bg-[var(--status-yellow-bg)] text-[var(--text-primary)]",
  critical:"border-[var(--status-red-border)] bg-[var(--status-red-bg)] text-[var(--text-primary)]",
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
    <header className="mb-7">
      {/* Eyebrow */}
      <p className="label-caps mb-2">{eyebrow}</p>

      {/* Title + meta grid */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] xl:items-start">
        <div>
          <h1 className="text-[1.6rem] font-bold leading-[1.15] tracking-[-0.028em] text-[var(--text-primary)] sm:text-[1.9rem]">
            {title}
          </h1>
          <p className="mt-2 max-w-xl text-[14px] leading-[1.6] text-[var(--text-secondary)]">
            {description}
          </p>
        </div>

        {meta.length ? (
          <div className="grid grid-cols-2 gap-3">
            {meta.map((item) => {
              const toneClass = metaToneConfig[item.tone ?? "neutral"];
              return (
                <div
                  key={item.label}
                  className={`flex flex-col justify-between rounded-[12px] border px-4 py-3 transition-colors ${toneClass}`}
                >
                  <p className="label-caps">{item.label}</p>
                  <p className="data-value mt-2 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </header>
  );
}
