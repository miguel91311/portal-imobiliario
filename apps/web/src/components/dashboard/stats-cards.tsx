import { LucideIcon } from 'lucide-react';

interface Stat {
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color: string;
}

interface StatsCardsProps {
  stats: Stat[];
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="p-5 rounded-2xl bg-surface-elevated border border-border shadow-card hover:shadow-soft transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            {s.change && (
              <span
                className={`text-overline px-2 py-1 rounded-full ${
                  s.changeType === 'positive'
                    ? 'bg-emerald-50 text-emerald-700'
                    : s.changeType === 'negative'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-cream-200 text-foreground-muted'
                }`}
              >
                {s.change}
              </span>
            )}
          </div>
          <p className="font-serif text-heading-2 text-foreground">{s.value}</p>
          <p className="text-caption text-foreground-muted mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
