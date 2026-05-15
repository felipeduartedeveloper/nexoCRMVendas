interface Props {
  value: number;
  showLabel?: boolean;
  color?: string;
}

export function ProgressBar({ value, showLabel = true, color = '#3b82f6' }: Props) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${v}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <span className="text-[11px] font-semibold tabular-nums text-ink-600">{v}%</span>
      )}
    </div>
  );
}
