import { GlassCard } from "./glass-card";
import { AvatarGroup } from "./avatar-group";
import { cn } from "@/lib/utils";

interface ActiveUsersCardProps {
  peakToday: number;
  maxCapacity: number;
  avatars: Array<{ src: string; alt: string; name?: string }>;
  className?: string;
}

/**
 * ActiveUsersCard - Shows active users with avatar stack and peak indicator
 * Used in dashboard for quick user overview
 */
export function ActiveUsersCard({
  peakToday,
  maxCapacity,
  avatars,
  className,
}: ActiveUsersCardProps) {
  const percentUsed = (peakToday / maxCapacity) * 100;

  return (
    <GlassCard className={cn("flex flex-col justify-between", className)}>
      <div>
        <span className="text-xs font-bold text-primary-container uppercase tracking-widest mb-4 block">
          Active Users
        </span>
        <div className="flex items-center gap-4">
          <AvatarGroup avatars={avatars} maxDisplay={3} size="md" />
        </div>
      </div>

      {/* Peak stats */}
      <div className="mt-6 border-t border-neutral-800 pt-4">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-neutral-400">Peak Today</span>
          <span className="text-on-surface font-bold">{peakToday.toLocaleString()}</span>
        </div>
        <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-primary-container h-full transition-all duration-300"
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      </div>
    </GlassCard>
  );
}
