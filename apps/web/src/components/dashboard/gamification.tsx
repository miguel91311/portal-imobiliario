'use client';

import { Trophy, Target, Flame, Medal, Star, TrendingUp } from 'lucide-react';

interface KPI {
  label: string;
  current: number;
  target: number;
  unit: string;
}

const kpis: KPI[] = [
  { label: 'Visitas Agendadas', current: 12, target: 20, unit: '' },
  { label: 'Propostas Submetidas', current: 4, target: 10, unit: '' },
  { label: 'Volume Fechado', current: 1_250_000, target: 2_000_000, unit: '€' },
  { label: 'Leads Qualificados', current: 18, target: 30, unit: '' },
];

const badges = [
  { name: 'Estrela em Ascensão', icon: Star, unlocked: true, color: 'text-amber-500' },
  { name: 'Negociador de Elite', icon: Trophy, unlocked: true, color: 'text-accent' },
  { name: 'Fechador de Ouro', icon: Medal, unlocked: false, color: 'text-foreground-muted' },
  { name: 'Especialista Talatona', icon: Target, unlocked: false, color: 'text-foreground-muted' },
  { name: 'Maratonista', icon: Flame, unlocked: true, color: 'text-red-500' },
];

export function Gamification() {
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-accent/10">
            <TrendingUp className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-serif text-heading-3 text-foreground">Performance Sprint</h3>
            <p className="text-caption text-foreground-muted">Maio 2026 · Equipa Alpha</p>
          </div>
        </div>
        <div className="space-y-5">
          {kpis.map((kpi) => {
            const pct = Math.min(100, (kpi.current / kpi.target) * 100);
            return (
              <div key={kpi.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-body text-foreground">{kpi.label}</span>
                  <span className="text-caption text-foreground-muted">
                    {kpi.unit === '€'
                      ? `${kpi.current.toLocaleString('pt-PT')} / ${kpi.target.toLocaleString('pt-PT')} ${kpi.unit}`
                      : `${kpi.current} / ${kpi.target}`}
                  </span>
                </div>
                <div className="h-2.5 bg-cream-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-700 ease-luxury"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges */}
      <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6">
        <h3 className="font-serif text-heading-3 text-foreground mb-4">Distintivos</h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {badges.map((badge) => (
            <div key={badge.name} className={`flex flex-col items-center text-center gap-2 ${!badge.unlocked ? 'opacity-40' : ''}`}>
              <div className={`w-12 h-12 rounded-xl bg-cream-100 flex items-center justify-center`}>
                <badge.icon className={`w-6 h-6 ${badge.color}`} />
              </div>
              <span className="text-overline text-foreground-muted leading-tight">{badge.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
