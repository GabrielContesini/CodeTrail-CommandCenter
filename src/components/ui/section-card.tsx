import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("glass-panel panel-ring rounded-[32px] p-6", className)}>
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle ? (
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
