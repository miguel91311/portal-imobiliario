'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { api } from '@/lib/api';
import { Webhook, Plus, Trash2, ToggleRight, ToggleLeft, Link2, Clock, CheckCircle2, X, RefreshCw } from 'lucide-react';

const EVENT_OPTIONS = [
  'property.created', 'property.updated', 'property.sold',
  'lead.created', 'lead.updated', 'lead.qualified',
  'document.uploaded', 'simulation.completed',
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', events: [] as string[], secret: '' });

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    setIsLoading(true);
    try {
      const data = await api.getWebhooks();
      setWebhooks(data.value);
    } catch {
      setWebhooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createWebhook(form);
      setForm({ name: '', url: '', events: [], secret: '' });
      setShowModal(false);
      loadWebhooks();
    } catch (err: any) {
      alert(err?.data?.error || 'Erro ao criar webhook');
    }
  };

  const toggleWebhook = async (id: string, isActive: boolean) => {
    try {
      await api.updateWebhook(id, { isActive: !isActive });
      loadWebhooks();
    } catch {
      alert('Erro ao alterar estado');
    }
  };

  const deleteWebhook = async (id: string) => {
    if (!confirm('Eliminar este webhook?')) return;
    try {
      await api.deleteWebhook(id);
      loadWebhooks();
    } catch {
      alert('Erro ao eliminar');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-cream-100">
        <Sidebar role="admin" userName="Admin" userRole="Chief Compliance Officer" />
        <div className="lg:ml-64">
          <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-serif text-heading-1 text-foreground">Gestão de Webhooks</h1>
                <p className="text-body text-foreground-muted mt-1">Notificações automáticas para URLs externas</p>
              </div>
              <button onClick={() => setShowModal(true)} className="btn-primary gap-2">
                <Plus className="w-4 h-4" />
                Novo Webhook
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-3 border-olive-200 border-t-olive-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {webhooks.map((wh) => (
                  <div key={wh.id} className="bg-surface-elevated rounded-2xl border border-border shadow-card p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Webhook className="w-5 h-5 text-accent" />
                          <h3 className="font-medium text-foreground">{wh.name}</h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-caption ${
                            wh.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {wh.isActive ? <CheckCircle2 className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            {wh.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-caption text-foreground-muted mb-2">
                          <Link2 className="w-3.5 h-3.5" />
                          {wh.url}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {wh.events.split(',').map((e: string) => (
                            <span key={e} className="px-2 py-0.5 bg-cream-200 rounded text-xs text-foreground-muted">{e}</span>
                          ))}
                        </div>
                        {wh.lastCalled && (
                          <div className="flex items-center gap-1.5 mt-2 text-caption text-foreground-muted">
                            <Clock className="w-3 h-3" />
                            Última chamada: {new Date(wh.lastCalled).toLocaleString('pt-PT')} · {wh.lastStatus || '—'}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleWebhook(wh.id, wh.isActive)}
                          className="p-2 rounded-lg hover:bg-cream-200 transition-colors"
                          title={wh.isActive ? 'Desativar' : 'Ativar'}
                        >
                          {wh.isActive ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                        </button>
                        <button
                          onClick={() => deleteWebhook(wh.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {webhooks.length === 0 && (
                  <div className="text-center py-12 text-foreground-muted bg-surface-elevated rounded-2xl border border-border">
                    <Webhook className="w-10 h-10 mx-auto mb-3 text-foreground-muted/50" />
                    <p className="text-body">Nenhum webhook configurado</p>
                    <p className="text-caption text-foreground-muted mt-1">Adicione um para receber notificações automáticas</p>
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
          <div className="bg-surface-elevated rounded-2xl border border-border shadow-2xl w-full max-w-lg p-6">
            <h2 className="font-serif text-heading-2 text-foreground mb-4">Novo Webhook</h2>
            <form onSubmit={createWebhook} className="space-y-4">
              <div>
                <label className="text-caption text-foreground-muted block mb-1">Nome</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body" />
              </div>
              <div>
                <label className="text-caption text-foreground-muted block mb-1">URL</label>
                <input type="url" required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body" placeholder="https://..." />
              </div>
              <div>
                <label className="text-caption text-foreground-muted block mb-1">Eventos</label>
                <div className="flex flex-wrap gap-2">
                  {EVENT_OPTIONS.map((event) => (
                    <label key={event} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      form.events.includes(event) ? 'bg-accent text-white' : 'bg-cream-100 text-foreground-muted border border-border'
                    }`}>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={form.events.includes(event)}
                        onChange={(e) => {
                          if (e.target.checked) setForm({ ...form, events: [...form.events, event] });
                          else setForm({ ...form, events: form.events.filter((ev) => ev !== event) });
                        }}
                      />
                      {event}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-caption text-foreground-muted block mb-1">Secret (opcional, para HMAC)</label>
                <input value={form.secret} onChange={(e) => setForm({ ...form, secret: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body" />
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
