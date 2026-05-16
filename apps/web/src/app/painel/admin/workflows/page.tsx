'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { api } from '@/lib/api';
import {
  Workflow, Plus, Trash2, ToggleRight, ToggleLeft, Play,
  ArrowRight, CheckCircle2, X, Mail, FileText, Bell, UserCheck
} from 'lucide-react';

const TRIGGER_OPTIONS = [
  'property.sold', 'property.created', 'property.updated',
  'lead.qualified', 'lead.created', 'lead.closed_won',
  'document.uploaded', 'simulation.completed',
];

const ACTION_TYPES = [
  { id: 'email', label: 'Enviar Email', icon: Mail },
  { id: 'notify', label: 'Notificação Push', icon: Bell },
  { id: 'generate_pdf', label: 'Gerar PDF', icon: FileText },
  { id: 'assign_agent', label: 'Atribuir Agente', icon: UserCheck },
];

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', trigger: 'property.sold',
    actions: [] as { type: string; config: Record<string, string> }[],
  });

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    setIsLoading(true);
    try {
      const data = await api.getWorkflows();
      setWorkflows(data.value);
    } catch {
      setWorkflows([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createWorkflow(form);
      setForm({ name: '', description: '', trigger: 'property.sold', actions: [] });
      setShowModal(false);
      loadWorkflows();
    } catch (err: any) {
      alert(err?.data?.error || 'Erro ao criar workflow');
    }
  };

  const toggleWorkflow = async (id: string, isActive: boolean) => {
    try {
      await api.updateWorkflow(id, { isActive: !isActive });
      loadWorkflows();
    } catch {
      alert('Erro ao alterar estado');
    }
  };

  const deleteWorkflow = async (id: string) => {
    if (!confirm('Eliminar este workflow?')) return;
    try {
      await api.deleteWorkflow(id);
      loadWorkflows();
    } catch {
      alert('Erro ao eliminar');
    }
  };

  const addAction = (type: string) => {
    setForm({
      ...form,
      actions: [...form.actions, { type, config: {} }],
    });
  };

  const removeAction = (index: number) => {
    setForm({
      ...form,
      actions: form.actions.filter((_, i) => i !== index),
    });
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-cream-100">
        <Sidebar role="admin" userName="Admin" userRole="Chief Compliance Officer" />
        <div className="lg:ml-64">
          <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-serif text-heading-1 text-foreground">Workflows Automáticos</h1>
                <p className="text-body text-foreground-muted mt-1">Automação low-code — Quando X acontece, faça Y</p>
              </div>
              <button onClick={() => setShowModal(true)} className="btn-primary gap-2">
                <Plus className="w-4 h-4" />
                Novo Workflow
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-3 border-olive-200 border-t-olive-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {workflows.map((wf) => {
                  const actions = JSON.parse(wf.actions || '[]');
                  return (
                    <div key={wf.id} className="bg-surface-elevated rounded-2xl border border-border shadow-card p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Workflow className="w-5 h-5 text-accent" />
                            <h3 className="font-medium text-foreground">{wf.name}</h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-caption ${
                              wf.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {wf.isActive ? <CheckCircle2 className="w-3 h-3" /> : <X className="w-3 h-3" />}
                              {wf.isActive ? 'Ativo' : 'Inativo'}
                            </span>
                            {wf.runCount > 0 && (
                              <span className="text-caption text-foreground-muted">
                                <Play className="w-3 h-3 inline mr-1" />
                                {wf.runCount} execuções
                              </span>
                            )}
                          </div>
                          {wf.description && <p className="text-caption text-foreground-muted mb-3">{wf.description}</p>}

                          <div className="flex items-center gap-2 text-sm">
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                              QUANDO: {wf.trigger}
                            </span>
                            <ArrowRight className="w-4 h-4 text-foreground-muted" />
                            <div className="flex items-center gap-2">
                              {actions.map((a: any, i: number) => {
                                const actionConfig = ACTION_TYPES.find((t) => t.id === a.type);
                                const Icon = actionConfig?.icon || Bell;
                                return (
                                  <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-cream-100 rounded text-xs text-foreground-muted">
                                    <Icon className="w-3 h-3" />
                                    {actionConfig?.label || a.type}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleWorkflow(wf.id, wf.isActive)}
                            className="p-2 rounded-lg hover:bg-cream-200 transition-colors"
                          >
                            {wf.isActive ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                          </button>
                          <button
                            onClick={() => deleteWorkflow(wf.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {workflows.length === 0 && (
                  <div className="text-center py-12 text-foreground-muted bg-surface-elevated rounded-2xl border border-border">
                    <Workflow className="w-10 h-10 mx-auto mb-3 text-foreground-muted/50" />
                    <p className="text-body">Nenhum workflow configurado</p>
                    <p className="text-caption text-foreground-muted mt-1">Crie automações para poupar tempo</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-elevated rounded-2xl border border-border shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="font-serif text-heading-2 text-foreground mb-4">Novo Workflow</h2>
            <form onSubmit={createWorkflow} className="space-y-4">
              <div>
                <label className="text-caption text-foreground-muted block mb-1">Nome</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body" />
              </div>
              <div>
                <label className="text-caption text-foreground-muted block mb-1">Descrição</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body" />
              </div>
              <div>
                <label className="text-caption text-foreground-muted block mb-1">Trigger (Quando)</label>
                <select value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body">
                  {TRIGGER_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-caption text-foreground-muted block mb-2">Ações (Faça)</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {ACTION_TYPES.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => addAction(action.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cream-100 text-xs text-foreground-muted hover:bg-cream-200 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      {action.label}
                    </button>
                  ))}
                </div>
                {form.actions.map((action, index) => {
                  const config = ACTION_TYPES.find((a) => a.id === action.type);
                  return (
                    <div key={index} className="flex items-center gap-2 p-3 bg-cream-50 rounded-xl border border-border mb-2">
                      {config && <config.icon className="w-4 h-4 text-foreground-muted" />}
                      <span className="text-sm text-foreground flex-1">{config?.label || action.type}</span>
                      <button type="button" onClick={() => removeAction(index)} className="p-1 rounded hover:bg-red-50 text-red-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-ghost">Cancelar</button>
                <button type="submit" className="flex-1 btn-primary gap-2"><Plus className="w-4 h-4" /> Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
