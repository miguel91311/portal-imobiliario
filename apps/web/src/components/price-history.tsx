'use client';

import { useEffect, useState, useCallback } from 'react';
import { TrendingDown, TrendingUp, History, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface PriceHistoryProps {
  propertyId: string;
  currency: string;
}

export function PriceHistory({ propertyId, currency }: PriceHistoryProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const data = await api.getPriceHistory(propertyId);
      setHistory(data.value);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  if (loading) {
    return (
      <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6">
        <Loader2 className="w-5 h-5 animate-spin text-foreground-muted" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <History className="w-5 h-5 text-olive-500" />
          <h3 className="font-serif text-heading-3 text-foreground">Histórico de Preços</h3>
        </div>
        <p className="text-caption text-foreground-muted">Sem alterações de preço registadas.</p>
      </div>
    );
  }

  const maxPrice = Math.max(...history.map((h) => Math.max(h.oldPrice, h.newPrice)));

  return (
    <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <History className="w-5 h-5 text-olive-500" />
        <div>
          <h3 className="font-serif text-heading-3 text-foreground">Histórico de Preços</h3>
          <p className="text-caption text-foreground-muted">{history.length} alteração{history.length > 1 ? 's' : ''} registada{history.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="space-y-4">
        {history.map((h, i) => {
          const diff = h.newPrice - h.oldPrice;
          const diffPct = h.oldPrice > 0 ? (diff / h.oldPrice) * 100 : 0;
          const isUp = diff > 0;
          return (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-cream-100 flex items-center justify-center shrink-0">
                {isUp ? <TrendingUp className="w-5 h-5 text-red-500" /> : <TrendingDown className="w-5 h-5 text-emerald-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-body text-foreground font-medium">
                    {h.newPrice.toLocaleString('pt-PT', { style: 'currency', currency, maximumFractionDigits: 0 })}
                  </span>
                  <span className={`text-caption ${isUp ? 'text-red-600' : 'text-emerald-600'}`}>
                    {isUp ? '+' : ''}{diffPct.toFixed(1)}%
                  </span>
                </div>
                <p className="text-caption text-foreground-muted">
                  Anterior: {h.oldPrice.toLocaleString('pt-PT', { style: 'currency', currency, maximumFractionDigits: 0 })}
                  {' · '}{new Date(h.createdAt).toLocaleDateString('pt-PT')}
                  {h.reason && ` · ${h.reason === 'market_adjustment' ? 'Ajuste de mercado' : 'Pedido do proprietário'}`}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mini chart */}
      <div className="mt-6 flex items-end gap-1 h-16">
        {history.map((h, i) => {
          const hMax = Math.max(h.oldPrice, h.newPrice);
          return (
            <div key={`bar-${i}`} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-0.5 items-end justify-center h-12">
                <div className="flex-1 bg-olive-200 rounded-t-sm" style={{ height: `${(h.oldPrice / maxPrice) * 100}%` }} />
                <div className="flex-1 bg-accent rounded-t-sm" style={{ height: `${(h.newPrice / maxPrice) * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-4 text-caption mt-2">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-olive-200" /> Anterior</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-accent" /> Novo</span>
      </div>
    </div>
  );
}
