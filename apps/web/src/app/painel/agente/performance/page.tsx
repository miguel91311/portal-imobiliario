'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import {
  Trophy, TrendingUp, Users, Building2, Target, BarChart3,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';

export default function PerformancePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [teamStats, setTeamStats] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [propsData, leadsData, teamsData] = await Promise.all([
        api.getProperties({ agentId: user?.id || '' }),
        api.getLeads(),
        api.getTeams(),
      ]);
      setProperties(propsData.value);
      setLeads(leadsData.value);

      if (teamsData.value.length > 0) {
        const tStats = await api.getTeamStats(teamsData.value[0].id);
        setTeamStats(tStats);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const totalViews = properties.reduce((sum, p) => sum + (p.viewCount || 0), 0);
  const totalContacts = properties.reduce((sum, p) => sum + (p.contactCount || 0), 0);
  const totalLeads = leads.length;
  const closedWon = leads.filter((l) => l.status === 'closed_won').length;
  const closedLost = leads.filter((l) => l.status === 'closed_lost').length;
  const activeLeads = totalLeads - closedWon - closedLost;
  const conversionRate = totalLeads > 0 ? Math.round((closedWon / totalLeads) * 100) : 0;

  const leadsByStatus = leads.reduce((acc: any, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {});

  const pipelineStages = [
    { key: 'new', label: 'Novo', color: 'bg-slate-500' },
    { key: 'qualified', label: 'Qualificado', color: 'bg-blue-500' },
    { key: 'visit_scheduled', label: 'Visita', color: 'bg-purple-500' },
    { key: 'proposal_sent', label: 'Proposta', color: 'bg-amber-500' },
    { key: 'reserved', label: 'Reservado', color: 'bg-emerald-500' },
    { key: 'closed_won', label: 'Fechado ✓', color: 'bg-green-600' },
    { key: 'closed_lost', label: 'Fechado ✗', color: 'bg-red-500' },
  ];

  const statsCards = [
    { label: 'Imóveis Ativos', value: properties.length, icon: Building2, color: 'bg-blue-500', change: null },
    { label: 'Leads Totais', value: totalLeads, icon: Users, color: 'bg-amber-500', change: null },
    { label: 'Taxa de Conversão', value: `${conversionRate}%`, icon: Target, color: 'bg-emerald-500', change: null },
    { label: 'Visualizações', value: totalViews.toLocaleString('pt-PT'), icon: TrendingUp, color: 'bg-purple-500', change: null },
  ];

  return (
    <ProtectedRoute allowedRoles={['admin', 'agent']}>
      <div className="min-h-screen bg-cream-100">
        <Sidebar role="agente" userName={user?.name || 'Agente'} userRole="Agente Imobiliário" />
        <div className="lg:ml-64">
          <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="font-serif text-heading-1 text-foreground">Performance & KPIs</h1>
              <p className="text-body text-foreground-muted mt-1">Métricas de desempenho individual e da equipa</p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-3 border-olive-200 border-t-olive-500 rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {statsCards.map((s) => (
                    <div key={s.label} className="bg-surface-elevated rounded-2xl border border-border shadow-card p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-9 h-9 rounded-lg ${s.color}/10 flex items-center justify-center`}>
                          <s.icon className={`w-4.5 h-4.5 ${s.color.replace('bg-', 'text-')}`} />
                        </div>
                        <span className="text-caption text-foreground-muted">{s.label}</span>
                      </div>
                      <p className="font-serif text-heading-1 text-foreground">{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Pipeline Distribution */}
                  <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6">
                    <h3 className="font-serif text-heading-3 text-foreground mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-olive-500" />
                      Distribuição do Pipeline
                    </h3>
                    <div className="space-y-3">
                      {pipelineStages.map((stage) => {
                        const count = leadsByStatus[stage.key] || 0;
                        const pct = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
                        return (
                          <div key={stage.key}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-body text-foreground">{stage.label}</span>
                              <span className="text-caption text-foreground-muted">{count}</span>
                            </div>
                            <div className="h-2.5 bg-cream-200 rounded-full overflow-hidden">
                              <div className={`h-full ${stage.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Team Stats (if applicable) */}
                  {teamStats ? (
                    <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6">
                      <h3 className="font-serif text-heading-3 text-foreground mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        Estatísticas da Equipa
                      </h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-cream-50 rounded-xl p-4 text-center">
                          <p className="font-serif text-2xl text-foreground">{teamStats.totalLeads}</p>
                          <p className="text-caption text-foreground-muted">Leads da equipa</p>
                        </div>
                        <div className="bg-cream-50 rounded-xl p-4 text-center">
                          <p className="font-serif text-2xl text-foreground">{teamStats.totalProperties}</p>
                          <p className="text-caption text-foreground-muted">Imóveis da equipa</p>
                        </div>
                        <div className="bg-cream-50 rounded-xl p-4 text-center">
                          <p className="font-serif text-2xl text-emerald-600">{teamStats.conversionRate}%</p>
                          <p className="text-caption text-foreground-muted">Conversão equipa</p>
                        </div>
                        <div className="bg-cream-50 rounded-xl p-4 text-center">
                          <p className="font-serif text-2xl text-foreground">{teamStats.closedWon}</p>
                          <p className="text-caption text-foreground-muted">Fechados</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6 flex flex-col items-center justify-center text-center">
                      <Users className="w-10 h-10 text-foreground-muted/50 mb-3" />
                      <h3 className="font-serif text-heading-3 text-foreground mb-1">Sem Equipa</h3>
                      <p className="text-body text-foreground-muted max-w-sm">
                        Junte-se a uma equipa para ver estatísticas agregadas e partilhar recursos com outros agentes.
                      </p>
                    </div>
                  )}
                </div>

                {/* Recent Activity */}
                <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6">
                  <h3 className="font-serif text-heading-3 text-foreground mb-4">Leads Recentes</h3>
                  {leads.length === 0 ? (
                    <p className="text-body text-foreground-muted text-center py-8">Ainda não tem leads registados</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left text-overline text-foreground-muted uppercase tracking-wider px-4 py-3">Nome</th>
                            <th className="text-left text-overline text-foreground-muted uppercase tracking-wider px-4 py-3">Imóvel</th>
                            <th className="text-left text-overline text-foreground-muted uppercase tracking-wider px-4 py-3">Status</th>
                            <th className="text-left text-overline text-foreground-muted uppercase tracking-wider px-4 py-3">Score</th>
                            <th className="text-right text-overline text-foreground-muted uppercase tracking-wider px-4 py-3">Data</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leads.slice(0, 10).map((lead) => (
                            <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-cream-50/50">
                              <td className="px-4 py-3 text-body text-foreground">{lead.name}</td>
                              <td className="px-4 py-3 text-caption text-foreground-muted">{lead.property?.title || '—'}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                  lead.status === 'closed_won' ? 'bg-green-50 text-green-700' :
                                  lead.status === 'closed_lost' ? 'bg-red-50 text-red-700' :
                                  lead.status === 'reserved' ? 'bg-emerald-50 text-emerald-700' :
                                  'bg-blue-50 text-blue-700'
                                }`}>
                                  {lead.status === 'new' ? 'Novo' :
                                   lead.status === 'qualified' ? 'Qualificado' :
                                   lead.status === 'visit_scheduled' ? 'Visita' :
                                   lead.status === 'proposal_sent' ? 'Proposta' :
                                   lead.status === 'reserved' ? 'Reservado' :
                                   lead.status === 'closed_won' ? 'Fechado ✓' :
                                   lead.status === 'closed_lost' ? 'Fechado ✗' : lead.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className={`w-2 h-2 rounded-full ${i < Math.round((lead.score || 0) / 20) ? 'bg-amber-400' : 'bg-cream-200'}`} />
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right text-caption text-foreground-muted">
                                {new Date(lead.createdAt).toLocaleDateString('pt-PT')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
