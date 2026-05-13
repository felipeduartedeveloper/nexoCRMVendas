import { useState } from 'react';
import { Users, Building2, Clock, Merge } from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { PeopleTab } from '../components/PeopleTab';
import { OrganizationsTab } from '../components/OrganizationsTab';
import { TimelineTab } from '../components/TimelineTab';
import { MergeDuplicatesTab } from '../components/MergeDuplicatesTab';
import { cn } from '@/lib/cn';

type Tab = 'people' | 'organizations' | 'timeline' | 'merge';

const TABS: { value: Tab; label: string; icon: any }[] = [
  { value: 'people', label: 'People', icon: Users },
  { value: 'organizations', label: 'Organizations', icon: Building2 },
  { value: 'timeline', label: 'Contacts timeline', icon: Clock },
  { value: 'merge', label: 'Merge duplicates', icon: Merge },
];

export function ContactsPage() {
  const [tab, setTab] = useState<Tab>('people');

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Contatos"
        subtitle="Pessoas e empresas com quem você está construindo relacionamento."
      />

      <div className="rounded-xl border border-ink-200 bg-white shadow-card">
        <nav
          className="flex overflow-x-auto border-b border-ink-200"
          role="tablist"
          aria-label="Abas de contatos"
        >
          {TABS.map((t) => {
            const active = tab === t.value;
            return (
              <button
                key={t.value}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.value)}
                className={cn(
                  'flex shrink-0 items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors',
                  active
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-ink-600 hover:text-ink-900',
                )}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </nav>

        {tab === 'people' && <PeopleTab />}
        {tab === 'organizations' && <OrganizationsTab />}
        {tab === 'timeline' && <TimelineTab />}
        {tab === 'merge' && <MergeDuplicatesTab />}
      </div>
    </div>
  );
}
