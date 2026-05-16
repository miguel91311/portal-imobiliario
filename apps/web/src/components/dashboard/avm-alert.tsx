'use client';

import { TrendingUp, TrendingDown, Bell, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface AVMDataPoint {
  month: string;
  value: number;
  estimate: number;
}

const mockHistory: AVMDataPoint[] = [
  { month: 'Jan', value: 320000, estimate: 318000 },
  { month: 'Fev', value: 322000, estimate: 321000 },
  { month: 'Mar', value: 325000, estimate: 324500 },
  { month: 'Abr', value: 328000, estimate: 327000 },
  { month: 'Mai', value: 335000, estimate: 332000 },
  { month: 'Jun', value: 340000, estimate: 338000 },
];

export function AVMAlert() {
  const current = mockHistory[mockHistory.length - 1];
  const previous = mockHistory[mockHistory.length - 2];
  const change = current.value - previous.value;
  const changePct = (change / previous.value) * 100;
  const confidence = 94;

  const maxVal = Math.max(...mockHistory.map((d) => Math.max(d.value, d.estimate)));

  return (
    <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-serif text-heading-3 text-foreground">Alertas de Avaliação (AVM)</h3>
          <p className="text-caption text-foreground-muted mt-0.5">Modelo hedónico atualizado em tempo real</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-overline">
          <Bell className="w-3.5 h-3.5" />
          Score {confidence}%
        </div>
      </div>

      {/* Valor atual */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-overline text-foreground-muted uppercase">Valor Estimado Atual</p>
          <p className="font-serif text-display text-olive-500 mt-1">
            {current.value.toLocaleString('pt-PT')} €
          </p>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-overline ${change >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {change >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {change >= 0 ? '+' : ''}{changePct.toFixed(2)}% este mês
        </div>
      </div>

      {/* Gráfico de barras simplificado */}
      <div className="flex items-end gap-2 h-32 mb-4">
        {mockHistory.map((point) => (
          <div key={point.month} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="w-full flex gap-0.5 items-end justify-center h-24">
              <div
                className="w-full bg-olive-200 rounded-t-sm"
                style={{ height: `${(point.value / maxVal) * 100}%` }}
              />
              <div
                className="w-full bg-accent/40 rounded-t-sm"
                style={{ height: `${(point.estimate / maxVal) * 100}%` }}
              />
            </div>
            <span className="text-overline text-foreground-muted">{point.month}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-6 text-caption">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-olive-200" /> Valor real
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-accent/40" /> Estimativa AVM
        </span>
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-cream-50 rounded-xl border border-border">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-body text-foreground font-medium">Tendência de valorização positiva</p>
            <p className="text-caption text-foreground-muted mt-1">
              A zona de {`Cascais`} registou um aumento médio de 2,1% no último trimestre. 
              O prémio de localização (Walk Score 91) contribui com +8% face à média nacional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
