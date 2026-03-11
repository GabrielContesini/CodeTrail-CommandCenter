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
        "rounded-[16px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {/* Section header */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
        <div>
          <h3 className="text-[14px] font-semibold text-[var(--text-primary)] tracking-tight">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-0.5 text-[12px] text-[var(--text-tertiary)]">
              {subtitle}
            </p>
          ) : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>

      {/* Section body */}
      <div className="p-5">{children}</div>
    </section>
  );
}
