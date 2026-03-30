import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface TableColumn {
  key: string;
  label: string;
  width?: string;
}

interface TableRow {
  id: string;
  avatar?: string;
  name: string;
  subtitle?: string;
  cells: Record<string, React.ReactNode>;
  actions?: React.ReactNode;
}

interface UserDirectoryTableProps {
  columns: TableColumn[];
  rows: TableRow[];
  isLoading?: boolean;
  className?: string;
}

/**
 * UserDirectoryTable - Redesigned user table with modern styling
 * Implements the new dark theme with hover effects and better UX
 */
export function UserDirectoryTable({
  columns,
  rows,
  isLoading,
  className,
}: UserDirectoryTableProps) {
  return (
    <div
      className={cn(
        "bg-surface-container rounded-xl border border-outline-variant/30 overflow-hidden",
        className
      )}
    >
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-neutral-800/50 border-b border-outline-variant/30">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500",
                  col.width
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/20">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center">
                <div className="inline-block animate-spin">
                  <div className="h-6 w-6 border-2 border-primary-container border-t-transparent rounded-full"></div>
                </div>
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center">
                <p className="text-neutral-500 text-sm">No users found</p>
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-neutral-800/30 transition-colors group"
              >
                {/* User Profile Cell (special handling) */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {row.avatar && (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={row.avatar}
                          alt={row.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-on-surface">{row.name}</p>
                      {row.subtitle && (
                        <p className="text-xs text-neutral-500">{row.subtitle}</p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Other Cells */}
                {columns.slice(1).map((col) => (
                  <td key={col.key} className={cn("px-6 py-4", col.width)}>
                    <div className="text-sm">{row.cells[col.key]}</div>
                  </td>
                ))}

                {/* Actions Cell */}
                <td className="px-6 py-4 text-right">
                  {row.actions || (
                    <button className="p-2 text-neutral-500 hover:text-primary-container transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/**
 * UserRoleTag - Role badge with icon
 */
export function UserRoleTag({
  role,
  size = "md",
}: {
  role: "administrator" | "editor" | "viewer";
  size?: "sm" | "md" | "lg";
}) {
  const roleConfig = {
    administrator: {
      icon: "shield",
      bg: "bg-neutral-800",
      text: "text-neutral-300",
      label: "Administrator",
    },
    editor: {
      icon: "edit_note",
      bg: "bg-neutral-800",
      text: "text-neutral-300",
      label: "Editor",
    },
    viewer: {
      icon: "visibility",
      bg: "bg-neutral-800",
      text: "text-neutral-300",
      label: "Viewer",
    },
  };

  const config = roleConfig[role];
  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-1.5",
    lg: "px-4 py-2 text-base gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-bold",
        config.bg,
        config.text,
        sizeClasses[size]
      )}
    >
      <span className="material-symbols-outlined text-xs">{config.icon}</span>
      {config.label}
    </span>
  );
}

/**
 * SubscriptionBadge - Subscription tier badge
 */
export function SubscriptionBadge({
  tier,
}: {
  tier: "free" | "professional" | "enterprise" | "enterprise_plus";
}) {
  const tierConfig = {
    free: {
      color: "text-neutral-400",
      label: "Free Tier",
    },
    professional: {
      color: "text-on-surface",
      label: "Professional",
    },
    enterprise: {
      color: "text-primary-container",
      label: "Enterprise",
    },
    enterprise_plus: {
      color: "text-primary-container",
      label: "Enterprise Plus",
    },
  };

  const config = tierConfig[tier];

  return (
    <span className={cn("text-sm font-medium", config.color)}>
      {config.label}
    </span>
  );
}

/**
 * AccountStatusBadge - Account status indicator
 */
export function AccountStatusBadge({
  status,
}: {
  status: "active" | "suspended" | "pending";
}) {
  const statusConfig = {
    active: {
      dot: "bg-emerald-400",
      label: "Active",
      text: "text-emerald-400",
    },
    suspended: {
      dot: "bg-red-500",
      label: "Suspended",
      text: "text-red-400",
    },
    pending: {
      dot: "bg-amber-400",
      label: "Pending",
      text: "text-amber-400",
    },
  };

  const config = statusConfig[status];

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-bold", config.text)}>
      <span className={cn("inline-block w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
