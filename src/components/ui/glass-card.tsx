import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "interactive";
}

/**
 * GlassCard - Modern glassmorphism card with blur effect
 * Used as a base container for dashboard cards, metrics, and panels
 */
export function GlassCard({
  children,
  variant = "default",
  className,
  ...props
}: GlassCardProps) {
  const variantClasses = {
    default:
      "glass-card border border-outline-variant/30 backdrop-blur-md bg-[rgba(32,31,31,0.6)]",
    elevated:
      "glass-card border border-outline-variant/50 backdrop-blur-lg bg-[rgba(32,31,31,0.8)] shadow-panel",
    interactive:
      "glass-card border border-outline-variant/30 backdrop-blur-md bg-[rgba(32,31,31,0.6)] transition-all duration-200 hover:border-outline hover:shadow-raised",
  };

  return (
    <div
      className={cn("rounded-xl p-6", variantClasses[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}
