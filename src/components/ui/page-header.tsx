type MetaItem = {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warning" | "critical";
};

const metaToneConfig = {
  neutral: "border-[var(--border-neutral)] bg-[var(--bg-surface-container)] text-[var(--text-primary)]",
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
    <header className="mb-8">
      {/* Title + description */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            {title}
          </h2>
          <p className="text-[var(--text-tertiary)] mt-1 text-sm max-w-xl">
            {description}
          </p>
        </div>
      </div>

      {/* Meta chips */}
      {meta.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          {meta.map((item) => {
            const toneClass = metaToneConfig[item.tone ?? "neutral"];
            return (
              <div
                key={item.label}
                className={`flex flex-col justify-between rounded-xl border px-4 py-3 transition-colors ${toneClass}`}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-quaternary)]">
                  {item.label}
                </p>
                <p className="mt-2 text-sm font-semibold tracking-tight text-[var(--text-primary)] tabular-nums">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </header>
  );
}
