/**
 * Material Icon Component
 * Wraps Material Symbols Outlined with proper font-variation-settings
 * 
 * @example
 * <MaterialIcon name="check_circle" />
 * <MaterialIcon name="shield_with_heart" filled />
 * <MaterialIcon name="dashboard" className="text-cyan-400" weight={700} />
 */

interface MaterialIconProps {
  /** Icon name from Material Symbols Outlined */
  name: string;
  /** Tailwind classes for styling */
  className?: string;
  /** Whether icon should be filled (FILL=1) */
  filled?: boolean;
  /** Font weight (100-700) */
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  /** Grade value for visual emphasis (-25, 0, 200) */
  grade?: -25 | 0 | 200;
  /** Optical size (20, 24, 40, 48) */
  opticalSize?: 20 | 24 | 40 | 48;
}

export function MaterialIcon({
  name,
  className = '',
  filled = false,
  weight = 400,
  grade = 0,
  opticalSize = 24,
}: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`,
      }}
    >
      {name}
    </span>
  );
}
