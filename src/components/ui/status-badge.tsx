import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "online" | "degrading" | "offline" | "active" | "pending" | "suspended";
  label: string;
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

/**
 * StatusBadge - Visual indicator for system or user status
 * Displays a colored dot with label
 */
export function StatusBadge({
  status,
  label,
  icon,
  size = "md",
}: StatusBadgeProps) {
  const statusStyles = {
    online:
      "bg-emerald-500/10 text-emerald-300 dot-color-emerald",
    degrading:
      "bg-amber-500/10 text-amber-300 dot-color-amber",
    offline:
      "bg-rose-500/10 text-rose-300 dot-color-rose",
    active:
      "bg-emerald-400/10 text-emerald-400",
    pending:
      "bg-amber-400/10 text-amber-400",
    suspended:
      "bg-red-500/10 text-red-400",
  };

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-3 py-1.5 text-sm gap-2",
    lg: "px-4 py-2 text-base gap-2",
  };

  const dotColorMap = {
    online: "bg-emerald-400",
    degrading: "bg-amber-400",
    offline: "bg-rose-400",
    active: "bg-emerald-400",
    pending: "bg-amber-400",
    suspended: "bg-red-500",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold rounded-full",
        statusStyles[status],
        sizeClasses[size]
      )}
    >
      <span
        className={cn(
          "inline-block rounded-full",
          dotColorMap[status],
          size === "sm" && "w-1.5 h-1.5",
          size === "md" && "w-2 h-2",
          size === "lg" && "w-2.5 h-2.5"
        )}
      />
      {icon && <span className="flex items-center">{icon}</span>}
      <span>{label}</span>
    </div>
  );
}
