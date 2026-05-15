import { AlertTriangle, CheckCircle2, Clock, Pause } from 'lucide-react';
import { HEALTH_LABELS, type ProjectHealth } from '@/api/projects.api';

const STYLES: Record<ProjectHealth, { cls: string; Icon: typeof CheckCircle2 }> = {
  ON_TRACK: { cls: 'bg-success/10 text-success', Icon: CheckCircle2 },
  AT_RISK: { cls: 'bg-warning/10 text-warning', Icon: AlertTriangle },
  OFF_TRACK: { cls: 'bg-danger/10 text-danger', Icon: Clock },
  ON_HOLD: { cls: 'bg-ink-100 text-ink-600', Icon: Pause },
};

export function HealthBadge({ value }: { value: ProjectHealth }) {
  const { cls, Icon } = STYLES[value];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cls}`}
    >
      <Icon className="h-3 w-3" />
      {HEALTH_LABELS[value]}
    </span>
  );
}
