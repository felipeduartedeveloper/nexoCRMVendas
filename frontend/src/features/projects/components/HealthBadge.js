import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertTriangle, CheckCircle2, Clock, Pause } from 'lucide-react';
import { HEALTH_LABELS } from '@/api/projects.api';
const STYLES = {
    ON_TRACK: { cls: 'bg-success/10 text-success', Icon: CheckCircle2 },
    AT_RISK: { cls: 'bg-warning/10 text-warning', Icon: AlertTriangle },
    OFF_TRACK: { cls: 'bg-danger/10 text-danger', Icon: Clock },
    ON_HOLD: { cls: 'bg-muted text-muted-foreground', Icon: Pause },
};
export function HealthBadge({ value }) {
    const { cls, Icon } = STYLES[value];
    return (_jsxs("span", { className: `inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cls}`, children: [_jsx(Icon, { className: "h-3 w-3" }), HEALTH_LABELS[value]] }));
}
