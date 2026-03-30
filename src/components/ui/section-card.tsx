import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  subtitle,
  children,
  className,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-container)] shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {/* Section header */}
      <div className="flex items-center justify-between border-b border-[var(--border-neutral)] px-6 py-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
              {subtitle}
            </p>
          ) : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>

      {/* Section body */}
      <div className="p-6">{children}</div>
    </section>
  );
}
