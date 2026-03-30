import React from "react";
import { GlassCard, StatCard } from "@/components/ui";
import { cn } from "@/lib/utils";

interface AnalyticsChartProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * AnalyticsChart - Container for analytics charts with modern design
 */
export function AnalyticsChart({
  title,
  subtitle,
  children,
  className,
}: AnalyticsChartProps) {
  return (
    <GlassCard className={cn("rounded-xl overflow-hidden flex flex-col", className)}>
      <div className="p-6 border-b border-outline-variant/30 flex justify-between items-start">
        <div>
          <h4 className="text-on-surface font-bold">{title}</h4>
          {subtitle && <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>}
        </div>
      </div>
      <div className="flex-1 p-6 flex items-center justify-center min-h-64">
        {children}
      </div>
    </GlassCard>
  );
}

/**
 * LineChartMock - SVG line chart mockup with gradient
 */
export function LineChartMock() {
  return (
    <div className="w-full h-64 relative">
      <svg
        className="w-full h-full"
        preserveAspectRatio="none"
        viewBox="0 0 800 300"
      >
        <defs>
          <linearGradient id="cyanGradientAnalytics" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid Lines */}
        <line stroke="#333" strokeDasharray="4" x1="0" x2="800" y1="50" y2="50" />
        <line stroke="#333" strokeDasharray="4" x1="0" x2="800" y1="150" y2="150" />
        <line stroke="#333" strokeDasharray="4" x1="0" x2="800" y1="250" y2="250" />

        {/* Area Fill */}
        <path
          d="M0,250 Q100,200 200,230 T400,100 T600,150 T800,50 L800,300 L0,300 Z"
          fill="url(#cyanGradientAnalytics)"
        ></path>

        {/* Line */}
        <path
          d="M0,250 Q100,200 200,230 T400,100 T600,150 T800,50"
          fill="none"
          stroke="#00E5FF"
          strokeLinecap="round"
          strokeWidth="4"
        ></path>

        {/* Data Points */}
        <circle cx="200" cy="230" fill="#00E5FF" r="4"></circle>
        <circle cx="400" cy="100" fill="#00E5FF" r="4"></circle>
        <circle cx="600" cy="150" fill="#00E5FF" r="4"></circle>
        <circle cx="800" cy="50" fill="#00E5FF" r="6" stroke="#000" strokeWidth="2"></circle>
      </svg>

      {/* Tooltip Mockup */}
      <div className="absolute top-[30px] right-[20px] bg-neutral-900 border border-primary-container/50 p-3 rounded-lg shadow-2xl backdrop-blur-md">
        <p className="text-[10px] text-neutral-400 font-bold uppercase">Peak Active</p>
        <p className="text-lg font-black text-primary-container">14.3k</p>
      </div>
    </div>
  );
}

/**
 * BarChartMock - SVG bar chart mockup
 */
export function BarChartMock() {
  const bars = [35, 55, 45, 70, 80, 90, 75];
  const maxValue = Math.max(...bars);

  return (
    <div className="w-full h-64 relative flex items-end justify-center gap-2">
      {bars.map((value, index) => (
        <div key={index} className="flex-1 flex flex-col items-center">
          <div
            className="w-full bg-gradient-to-t from-primary-container to-primary-container/60 rounded-t-md transition-all hover:opacity-80"
            style={{ height: `${(value / maxValue) * 200}px` }}
          />
          <span className="text-[10px] text-neutral-500 mt-2">
            {String.fromCharCode(65 + index)}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * NodeDensityMapMock - Geo-distribution visualization mockup
 */
export function NodeDensityMapMock() {
  return (
    <div className="relative w-full aspect-square bg-neutral-900 rounded-lg overflow-hidden flex items-center justify-center">
      {/* Abstract Map */}
      <div className="absolute inset-0 opacity-20 grayscale"></div>

      {/* Density Circles */}
      <div className="relative w-full h-full">
        <div className="absolute top-[20%] left-[30%] w-16 h-16 bg-primary-container/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-[20%] left-[30%] w-2 h-2 bg-primary-container rounded-full ring-4 ring-primary-container/30"></div>

        <div className="absolute top-[60%] left-[70%] w-24 h-24 bg-primary-container/30 rounded-full blur-2xl"></div>
        <div className="absolute top-[60%] left-[70%] w-3 h-3 bg-primary-container rounded-full ring-8 ring-primary-container/20"></div>

        <div className="absolute top-[40%] left-[50%] w-12 h-12 bg-primary-container/10 rounded-full blur-lg"></div>
        <div className="absolute top-[40%] left-[50%] w-1.5 h-1.5 bg-primary-container rounded-full ring-2 ring-primary-container/40"></div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md p-2 rounded border border-outline-variant/30">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary-container"></div>
            <span className="text-[10px] text-neutral-400">North America</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary-container/60"></div>
            <span className="text-[10px] text-neutral-400">Europe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary-container/30"></div>
            <span className="text-[10px] text-neutral-400">Asia Pacific</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * TableMetricsRow - Row in a metrics table
 */
interface TableMetricsRowProps {
  label: string;
  value: string | number;
  change: string;
  changeType: "positive" | "negative" | "neutral";
}

export function TableMetricsRow({
  label,
  value,
  change,
  changeType,
}: TableMetricsRowProps) {
  const changeColorMap = {
    positive: "text-emerald-400",
    negative: "text-rose-400",
    neutral: "text-neutral-500",
  };

  return (
    <tr className="border-b border-outline-variant/20 hover:bg-neutral-800/30 transition-colors">
      <td className="px-4 py-3 text-sm text-neutral-400">{label}</td>
      <td className="px-4 py-3 text-sm font-bold text-on-surface">{value}</td>
      <td className={cn("px-4 py-3 text-sm font-semibold", changeColorMap[changeType])}>
        {change}
      </td>
    </tr>
  );
}
