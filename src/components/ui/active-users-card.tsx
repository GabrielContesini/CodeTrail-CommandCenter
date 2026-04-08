import { GlassCard } from "./glass-card";
import { AvatarGroup } from "./avatar-group";
import { cn } from "@/lib/utils";

interface ActiveUsersCardProps {
  activeUsers: number;
  activeUsersLabel: string;
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
  activeUsers,
  activeUsersLabel,
  peakToday,
  maxCapacity,
  avatars,
  className,
}: ActiveUsersCardProps) {
  const percentUsed = maxCapacity > 0 ? (peakToday / maxCapacity) * 100 : 0;
  const visibleNames = avatars
    .map((avatar) => avatar.name?.trim())
    .filter((value): value is string => Boolean(value))
    .slice(0, 3);

  return (
    <GlassCard className={cn("flex flex-col justify-between", className)}>
      <div>
        <span className="text-xs font-bold text-primary-container uppercase tracking-widest mb-4 block">
          Active Users
        </span>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-4xl font-black tracking-tight text-on-surface">
              {activeUsers.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-neutral-400">{activeUsersLabel}</p>
          </div>
          <div
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-bold",
              activeUsers > 0
                ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                : "border border-outline-variant/40 bg-surface-container-high text-neutral-400",
            )}
          >
            {activeUsers > 0 ? "online" : "sem sinal"}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <AvatarGroup avatars={avatars} maxDisplay={5} size="md" />
        </div>

        {visibleNames.length > 0 ? (
          <p className="mt-3 text-xs leading-relaxed text-neutral-500">
            {visibleNames.join(", ")}
            {avatars.length > visibleNames.length
              ? ` +${avatars.length - visibleNames.length}`
              : ""}
          </p>
        ) : (
          <p className="mt-3 text-xs text-neutral-500">
            Nenhum usuario online dentro da janela monitorada.
          </p>
        )}
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
