import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Button - Modern button component with multiple variants
 * Supports primary (cyan), secondary (dark), tertiary (outline), and ghost styles
 */
export function Button({
  variant = "primary",
  size = "md",
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary:
      "bg-primary-container text-on-primary-container hover:brightness-110 active:scale-95 shadow-glow",
    secondary:
      "bg-surface-container-high text-on-surface border border-outline-variant/30 hover:bg-surface-bright active:scale-95",
    tertiary:
      "border border-outline-variant text-on-surface hover:bg-surface-container active:scale-95",
    ghost:
      "text-on-surface hover:bg-surface-container-high active:scale-95",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm font-semibold rounded-lg gap-2",
    md: "px-6 py-2.5 text-sm font-bold rounded-lg gap-2",
    lg: "px-8 py-3 text-base font-bold rounded-lg gap-3",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center transition-all duration-200",
        variantClasses[variant],
        sizeClasses[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {children}
    </button>
  );
}
