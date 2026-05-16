'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { LeadScoring } from '@/components/dashboard/lead-scoring';
import { Gamification } from '@/components/dashboard/gamification';
import { api, request } from '@/lib/api';
import { Users, Calendar, TrendingUp, Euro, Handshake, Calculator } from 'lucide-react';

const agentStats = [
  { label: 'Leads Ativos', value: '24', change: '+6 esta semana', changeType: 'positive' as const, icon: Users, color: 'bg-blue-500' },
  { label: 'Visitas Agendadas', value: '8', change: '3 para hoje', changeType: 'neutral' as const, icon: Calendar, color: 'bg-accent' },
  { label: 'Taxa de Conversão', value: '18%', change: '+2.4%', changeType: 'positive' as const, icon: TrendingUp, color: 'bg-emerald-500' },
  { label: 'Comissões YTD', value: '€84.5k', change: '+12%', changeType: 'positive' as const, icon: Euro, color: 'bg-olive-500' },
];

const cobrokingDeals = [
  { property: 'Penthouse Lisboa', partner: 'Sotheby\'s Portugal', share: '50%', status: 'open', value: '€3.2M' },
  { property: 'Moradia Talatona', partner: 'OLCapital Premium', share: '40%', status: 'negotiating', value: '2.85B Kz' },
];

export default function AgenteContent() {
  const [leads, setLeads] = useState<any[]>([]);
  const [simulations, setSimulations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getLeads().then((d) => setLeads(d.value)).catch(() => setLeads([])),
      request('/api/simulations').then((d: any) => setSimulations(d.value || [])).catch(() => setSimulations([])),
    ]).finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-cream-100">
      <Sidebar role="agente" userName="Carlos Mendes" userRole="Senior Broker · OLCapital" />
      <div className="lg:ml-64">
        <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="font-serif text-heading-1 text-foreground">Área do Agente</h1>
            <p className="text-body text-foreground-muted mt-1">Lead scoring, co-broking e performance</p>
          </div>

          <div className="mb-8">
            <StatsCards stats={agentStats} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <LeadScoring />
            <Gamification />
          </div>

          {/* Simulações = Leads Quentes */}
          {simulations.length > 0 && (
            <div className="mb-8 bg-surface-elevated rounded-2xl border border-border shadow-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Calculator className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-serif text-heading-3 text-foreground">Simulações Recentes</h3>
                  <p className="text-caption text-foreground-muted">Utilizadores que simularam impostos e deixaram contacto</p>
                </div>
              </div>
              <div className="space-y-3">
                {simulations.slice(0, 5).map((sim: any) => (
                  <div key={sim.id} className="p-4 rounded-xl bg-cream-50 border border-border flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-body text-foreground font-medium">{sim.name || 'Anónimo'}</span>
                        <span className="px-2 py-0.5 bg-accent/10 rounded text-overline text-accent uppercase">{sim.type}</span>
                        {sim.converted && <span className="px-2 py-0.5 bg-emerald-50 rounded text-overline text-emerald-700">Lead</span>}
                      </div>
                      <p className="text-caption text-foreground-muted">{sim.email} · {new Date(sim.createdAt).toLocaleDateString('pt-PT')}</p>
                    </div>
                    <div className="text-right">
                      {sim.property && <p className="text-caption text-foreground-muted">{sim.property.title}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="mb-8 p-6 rounded-2xl bg-surface-elevated border border-border text-center">
              <div className="w-8 h-8 border-2 border-olive-200 border-t-olive-500 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-caption text-foreground-muted">A sincronizar dados da API...</p>
            </div>
          )}

          {leads.length > 0 && (
            <div className="mb-8 bg-surface-elevated rounded-2xl border border-border shadow-card p-6">
              <h3 className="font-serif text-heading-3 text-foreground mb-4">Leads Sincronizados ({leads.length})</h3>
              <div className="space-y-3">
                {leads.map((lead) => (
                  <div key={lead.id} className="p-4 rounded-xl bg-cream-50 border border-border flex items-center justify-between">
                    <div>
                      <p className="text-body text-foreground font-medium">{lead.name}</p>
                      <p className="text-caption text-foreground-muted">{lead.email} · Score: {lead.score}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-overline ${
                      lead.status === 'hot' ? 'bg-red-50 text-red-700' : lead.status === 'warm' ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-600'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-50">
                <Handshake className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-serif text-heading-3 text-foreground">Acordos de Co-broking</h3>
                <p className="text-caption text-foreground-muted">Partilha transparente de comissões transfronteiriças</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-overline text-foreground-muted uppercase">Propriedade</th>
                    <th className="text-left px-4 py-3 text-overline text-foreground-muted uppercase">Parceiro</th>
                    <th className="text-left px-4 py-3 text-overline text-foreground-muted uppercase">Divisão</th>
                    <th className="text-left px-4 py-3 text-overline text-foreground-muted uppercase">Valor</th>
                    <th className="text-left px-4 py-3 text-overline text-foreground-muted uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {cobrokingDeals.map((deal, i) => (
                    <tr key={i} className="border-b border-border hover:bg-cream-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{deal.property}</td>
                      <td className="px-4 py-3 text-foreground-muted">{deal.partner}</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-cream-200 rounded text-overline">{deal.share}</span></td>
                      <td className="px-4 py-3 text-foreground">{deal.value}</td>
                      <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-overline ${deal.status === 'open' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{deal.status === 'open' ? 'Ativo' : 'Em negociação'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
