import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Users, Building2, Clock, Merge } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PeopleTab } from '../components/PeopleTab';
import { OrganizationsTab } from '../components/OrganizationsTab';
import { TimelineTab } from '../components/TimelineTab';
import { MergeDuplicatesTab } from '../components/MergeDuplicatesTab';
import { cn } from '@/lib/cn';
const TABS = [
    { value: 'people', label: 'People', icon: Users },
    { value: 'organizations', label: 'Organizations', icon: Building2 },
    { value: 'timeline', label: 'Contacts timeline', icon: Clock },
    { value: 'merge', label: 'Merge duplicates', icon: Merge },
];
export function ContactsPage() {
    const [tab, setTab] = useState('people');
    return (_jsxs("div", { className: "mx-auto max-w-[1600px]", children: [_jsx(PageHeader, { title: "Contatos", subtitle: "Pessoas e empresas com quem voc\u00EA est\u00E1 construindo relacionamento." }), _jsxs("div", { className: "rounded-xl border border-border bg-card shadow-card", children: [_jsx("nav", { className: "flex overflow-x-auto border-b border-border", role: "tablist", "aria-label": "Abas de contatos", children: TABS.map((t) => {
                            const active = tab === t.value;
                            return (_jsxs("button", { role: "tab", "aria-selected": active, onClick: () => setTab(t.value), className: cn('flex shrink-0 items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors', active
                                    ? 'border-brand-600 text-brand-700'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'), children: [_jsx(t.icon, { className: "h-4 w-4" }), " ", t.label] }, t.value));
                        }) }), tab === 'people' && _jsx(PeopleTab, {}), tab === 'organizations' && _jsx(OrganizationsTab, {}), tab === 'timeline' && _jsx(TimelineTab, {}), tab === 'merge' && _jsx(MergeDuplicatesTab, {})] })] }));
}
