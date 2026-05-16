'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { NavbarMarket } from '@/components/navbar-market';
import { FooterMarket } from '@/components/footer-market';
import { api } from '@/lib/api';
import { Bell, Plus, Trash2, Loader2, ArrowLeft, Eye, EyeOff, Mail } from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', city: '', country: 'PT' as 'PT' | 'AO', typology: '', minPrice: '', maxPrice: '' });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const data = await api.getAlerts();
      setAlerts(data.value);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const create = async () => {
    await api.createAlert({
      email: form.email,
      city: form.city || undefined,
      country: form.country,
      typology: form.typology || undefined,
      minPrice: form.minPrice ? Number(form.minPrice) : undefined,
      maxPrice: form.maxPrice ? Number(form.maxPrice) : undefined,
    });
    setShowForm(false);
    fetchAlerts();
  };

  const toggle = async (id: string) => {
    await api.toggleAlert(id);
    fetchAlerts();
  };

  const remove = async (id: string) => {
    await api.deleteAlert(id);
    fetchAlerts();
  };

  return (
    <main className="min-h-screen bg-cream-100">
      <NavbarMarket />
      <div className="pt-28 pb-20 luxury-container max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/pt" className="inline-flex items-center gap-2 text-caption text-foreground-muted hover:text-olive-500 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
            <h1 className="font-serif text-heading-1 text-foreground">Alertas</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Alerta
          </button>
        </div>

        {showForm && (
          <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6 mb-8 space-y-4">
            <h3 className="font-serif text-heading-3 text-foreground">Criar Alerta</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="px-4 py-2.5 rounded-xl border border-border bg-cream-50 text-sm" />
              <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value as 'PT' | 'AO' })} className="px-4 py-2.5 rounded-xl border border-border bg-cream-50 text-sm">
                <option value="PT">Portugal</option>
                <option value="AO">Angola</option>
              </select>
              <input type="text" placeholder="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="px-4 py-2.5 rounded-xl border border-border bg-cream-50 text-sm" />
              <input type="text" placeholder="Tipologia (ex: T3)" value={form.typology} onChange={(e) => setForm({ ...form, typology: e.target.value })} className="px-4 py-2.5 rounded-xl border border-border bg-cream-50 text-sm" />
              <input type="number" placeholder="Preço mínimo" value={form.minPrice} onChange={(e) => setForm({ ...form, minPrice: e.target.value })} className="px-4 py-2.5 rounded-xl border border-border bg-cream-50 text-sm" />
              <input type="number" placeholder="Preço máximo" value={form.maxPrice} onChange={(e) => setForm({ ...form, maxPrice: e.target.value })} className="px-4 py-2.5 rounded-xl border border-border bg-cream-50 text-sm" />
            </div>
            <button onClick={create} className="w-full btn-primary">Criar Alerta</button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-foreground-muted" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-20 bg-surface-elevated rounded-2xl border border-border">
            <Bell className="w-12 h-12 mx-auto mb-4 text-foreground-muted/30" />
            <p className="text-body text-foreground-muted">Sem alertas configurados.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${alert.isActive ? 'bg-accent/10' : 'bg-cream-200'}`}>
                    <Mail className={`w-5 h-5 ${alert.isActive ? 'text-accent' : 'text-foreground-muted'}`} />
                  </div>
                  <div>
                    <p className="text-body font-medium text-foreground">
                      {alert.city || 'Todas as cidades'} · {alert.country === 'PT' ? 'Portugal' : 'Angola'}
                    </p>
                    <p className="text-caption text-foreground-muted">
                      {alert.typology && `${alert.typology} · `}
                      {alert.minPrice && `Min: ${alert.minPrice.toLocaleString('pt-PT')} · `}
                      {alert.maxPrice && `Max: ${alert.maxPrice.toLocaleString('pt-PT')} · `}
                      {alert.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggle(alert.id)} className="p-2 rounded-lg hover:bg-cream-200 text-foreground-muted transition-colors" title={alert.isActive ? 'Desativar' : 'Ativar'}>
                    {alert.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => remove(alert.id)} className="p-2 rounded-lg hover:bg-red-50 text-foreground-muted hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <FooterMarket />
    </main>
  );
}
