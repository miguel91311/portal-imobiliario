'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { api } from '@/lib/api';
import {
  Users, Star, Phone, Mail, Calendar, ArrowRight, ArrowLeft,
  TrendingUp, TrendingDown, Minus, Search, Filter, RefreshCw,
  User, FileText, Calculator, Building2, X
} from 'lucide-react';

const PIPELINE_COLUMNS = [
  { id: 'new', label: 'Novo', color: 'bg-slate-100 border-slate-200', badge: 'bg-slate-500', headerColor: 'bg-slate-50 text-slate-700' },
  { id: 'qualified', label: 'Qualificado', color: 'bg-blue-50 border-blue-200', badge: 'bg-blue-500', headerColor: 'bg-blue-50 text-blue-700' },
  { id: 'visit_scheduled', label: 'Visita Agendada', color: 'bg-purple-50 border-purple-200', badge: 'bg-purple-500', headerColor: 'bg-purple-50 text-purple-700' },
  { id: 'proposal_sent', label: 'Proposta Enviada', color: 'bg-amber-50 border-amber-200', badge: 'bg-amber-500', headerColor: 'bg-amber-50 text-amber-700' },
  { id: 'reserved', label: 'Reservado', color: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-500', headerColor: 'bg-emerald-50 text-emerald-700' },
  { id: 'closed_won', label: 'Fechado ✓', color: 'bg-green-50 border-green-200', badge: 'bg-green-600', headerColor: 'bg-green-50 text-green-700' },
  { id: 'closed_lost', label: 'Fechado ✗', color: 'bg-red-50 border-red-200', badge: 'bg-red-500', headerColor: 'bg-red-50 text-red-700' },
];

const STATUS_ORDER = PIPELINE_COLUMNS.map(c => c.id);

export default function LeadsKanbanPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [lead360, setLead360] = useState<any>(null);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setIsLoading(true);
    try {
      const data = await api.getLeads();
      setLeads(data.value);
    } catch {
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  };

  const moveLead = async (leadId: string, direction: 'next' | 'prev') => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const currentIdx = STATUS_ORDER.indexOf(lead.status);
    const newIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1;
    if (newIdx < 0 || newIdx >= STATUS_ORDER.length) return;

    const newStatus = STATUS_ORDER[newIdx];
    try {
      await api.updateLeadStatus(leadId, newStatus);
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    } catch {
      alert('Erro ao mover lead');
    }
  };

  const scoreLead = async (leadId: string) => {
    try {
      const result = await api.scoreLead(leadId);
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, score: result.score } : l));
    } catch {
      alert('Erro ao calcular score');
    }
  };

  const openLead360 = async (lead: any) => {
    setSelectedLead(lead);
    try {
      const data = await api.getLead360(lead.id);
      setLead360(data);
    } catch {
      setLead360(null);
    }
  };

  const filteredLeads = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    l.property?.title?.toLowerCase().includes(search.toLowerCase())
  );

  const leadsByColumn = PIPELINE_COLUMNS.map(col => ({
    ...col,
    leads: filteredLeads.filter(l => l.status === col.id),
  }));

  const totalValue = leads
    .filter(l => l.status === 'closed_won')
    .reduce((sum, l) => sum + Number(l.property?.price || 0), 0);

  return (
    <ProtectedRoute allowedRoles={['admin', 'agent']}>
      <div className="min-h-screen bg-cream-100">
        <Sidebar role="agente" userName="Agente" userRole="Agente Imobiliário" />
        <div className="lg:ml-64">
          <div className="px-6 lg:px-10 py-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="font-serif text-heading-1 text-foreground">Pipeline de Vendas</h1>
                <p className="text-body text-foreground-muted mt-1">Kanban visual — arraste leads entre fases</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-serif text-heading-2 text-emerald-600">
                    {totalValue > 0 ? new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(totalValue) : '€0'}
                  </p>
                  <p className="text-caption text-foreground-muted">valor fechado</p>
                </div>
                <button onClick={loadLeads} className="btn-ghost gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Atualizar
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
              <input
                type="text"
                placeholder="Pesquisar leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20"
              />
            </div>

            {/* Kanban */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-3 border-olive-200 border-t-olive-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {leadsByColumn.map((col) => (
                  <div key={col.id} className="flex-shrink-0 w-72">
                    {/* Column Header */}
                    <div className={`rounded-xl px-4 py-3 mb-3 flex items-center justify-between ${col.headerColor}`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${col.badge}`} />
                        <span className="text-sm font-medium">{col.label}</span>
                      </div>
                      <span className="text-xs font-medium bg-white/60 px-2 py-0.5 rounded-full">
                        {col.leads.length}
                      </span>
                    </div>

                    {/* Cards */}
                    <div className={`rounded-xl border p-3 min-h-[200px] space-y-3 ${col.color}`}>
                      {col.leads.map((lead: any) => (
                        <div
                          key={lead.id}
                          className="bg-white rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => openLead360(lead)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-1">
                              <Star className={`w-3.5 h-3.5 ${lead.score >= 70 ? 'text-accent fill-accent' : 'text-foreground-muted'}`} />
                              <span className="text-xs font-medium text-foreground">{lead.score}</span>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); scoreLead(lead.id); }}
                              className="text-xs text-accent hover:underline"
                              title="Recalcular score"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>
                          </div>

                          <h4 className="text-sm font-medium text-foreground mb-1 truncate">{lead.name}</h4>
                          <p className="text-xs text-foreground-muted mb-2 truncate">{lead.email}</p>

                          {lead.property && (
                            <div className="flex items-center gap-1.5 mb-2">
                              <Building2 className="w-3 h-3 text-olive-500" />
                              <span className="text-xs text-olive-600 truncate">{lead.property.title}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 mb-3">
                            <Phone className="w-3 h-3 text-foreground-muted" />
                            <span className="text-xs text-foreground-muted">{lead.phone || 'Sem telefone'}</span>
                          </div>

                          {/* Move buttons */}
                          <div className="flex items-center gap-2 pt-2 border-t border-border">
                            <button
                              onClick={(e) => { e.stopPropagation(); moveLead(lead.id, 'prev'); }}
                              disabled={STATUS_ORDER.indexOf(lead.status) === 0}
                              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-cream-100 text-xs text-foreground-muted hover:bg-cream-200 disabled:opacity-30 transition-colors"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); moveLead(lead.id, 'next'); }}
                              disabled={STATUS_ORDER.indexOf(lead.status) === STATUS_ORDER.length - 1}
                              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-cream-100 text-xs text-foreground-muted hover:bg-cream-200 disabled:opacity-30 transition-colors"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {col.leads.length === 0 && (
                        <div className="text-center py-8 text-foreground-muted/50">
                          <Users className="w-6 h-6 mx-auto mb-2" />
                          <p className="text-xs">Sem leads</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lead 360 Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-elevated rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-surface-elevated border-b border-border px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-heading-2 text-foreground">Ficha 360º — {selectedLead.name}</h2>
                <p className="text-caption text-foreground-muted">Lead ID: {selectedLead.id}</p>
              </div>
              <button onClick={() => { setSelectedLead(null); setLead360(null); }} className="p-2 rounded-lg hover:bg-cream-200 transition-colors">
                <X className="w-5 h-5 text-foreground-muted" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-cream-50 border border-border">
                  <p className="text-caption text-foreground-muted mb-1">Email</p>
                  <p className="text-body text-foreground">{selectedLead.email}</p>
                </div>
                <div className="p-4 rounded-xl bg-cream-50 border border-border">
                  <p className="text-caption text-foreground-muted mb-1">Telefone</p>
                  <p className="text-body text-foreground">{selectedLead.phone || '—'}</p>
                </div>
                <div className="p-4 rounded-xl bg-cream-50 border border-border">
                  <p className="text-caption text-foreground-muted mb-1">Score</p>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-accent fill-accent" />
                    <span className="font-serif text-heading-3 text-foreground">{selectedLead.score}</span>
                    <button onClick={() => scoreLead(selectedLead.id)} className="text-xs text-accent hover:underline">Recalcular</button>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-cream-50 border border-border">
                  <p className="text-caption text-foreground-muted mb-1">Status</p>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-caption font-medium bg-blue-50 text-blue-700">
                    {PIPELINE_COLUMNS.find(c => c.id === selectedLead.status)?.label || selectedLead.status}
                  </span>
                </div>
              </div>

              {/* Property Interest */}
              {selectedLead.property && (
                <div className="p-4 rounded-xl bg-olive-50/50 border border-olive-200">
                  <h3 className="font-serif text-heading-3 text-olive-700 mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Interesse: {selectedLead.property.title}
                  </h3>
                  <p className="text-body text-olive-600">{selectedLead.property.city}</p>
                </div>
              )}

              {/* 360 Data */}
              {lead360 ? (
                <>
                  {/* Simulations */}
                  {lead360.simulations?.length > 0 && (
                    <div>
                      <h3 className="font-serif text-heading-3 text-foreground mb-3 flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-accent" />
                        Simulações ({lead360.simulations.length})
                      </h3>
                      <div className="space-y-2">
                        {lead360.simulations.map((s: any) => (
                          <div key={s.id} className="p-3 rounded-lg bg-cream-50 border border-border">
                            <p className="text-caption text-foreground-muted">{s.type} · {new Date(s.createdAt).toLocaleDateString('pt-PT')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other Leads */}
                  {lead360.otherLeads?.length > 0 && (
                    <div>
                      <h3 className="font-serif text-heading-3 text-foreground mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        Outros Interesses ({lead360.otherLeads.length})
                      </h3>
                      <div className="space-y-2">
                        {lead360.otherLeads.map((l: any) => (
                          <div key={l.id} className="p-3 rounded-lg bg-cream-50 border border-border">
                            <p className="text-body text-foreground">{l.property?.title || 'Imóvel'}</p>
                            <p className="text-caption text-foreground-muted">{l.property?.city} · {new Date(l.createdAt).toLocaleDateString('pt-PT')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-3 border-olive-200 border-t-olive-500 rounded-full animate-spin" />
                </div>
              )}

              {/* Notes */}
              {selectedLead.notes && (
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200">
                  <h3 className="font-serif text-heading-3 text-amber-700 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Notas
                  </h3>
                  <p className="text-body text-amber-800">{selectedLead.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
