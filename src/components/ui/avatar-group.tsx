/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";

interface AvatarItem {
  src: string;
  alt: string;
  name?: string;
}

interface AvatarGroupProps {
  avatars: AvatarItem[];
  maxDisplay?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * AvatarGroup - Stack of user avatars with overflow count
 * Displays up to maxDisplay avatars with a +N badge for the rest
 */
export function AvatarGroup({
  avatars,
  maxDisplay = 3,
  size = "md",
  className,
}: AvatarGroupProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const borderClasses = {
    sm: "border-2",
    md: "border-2",
    lg: "border-3",
  };

  const displayAvatars = avatars.slice(0, maxDisplay);
  const remaining = avatars.length - maxDisplay;

  return (
    <div className={cn("flex items-center -space-x-3", className)}>
      {displayAvatars.map((avatar, index) => (
        <div
          key={index}
          className={cn(
            "relative rounded-full border-neutral-900 overflow-hidden flex-shrink-0",
            sizeClasses[size],
            borderClasses[size]
          )}
          title={avatar.name}
        >
          <img
            src={avatar.src}
            alt={avatar.alt}
            className="h-full w-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
      ))}

      {remaining > 0 && (
        <div
          className={cn(
            "rounded-full border-neutral-900 bg-neutral-800 flex items-center justify-center font-bold text-neutral-300 flex-shrink-0",
            sizeClasses[size],
            borderClasses[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
