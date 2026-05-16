'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import { Eye, MessageSquare, Building2, TrendingUp, Plus, Star } from 'lucide-react';

export default function ProprietarioContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, listingsData] = await Promise.all([
        api.getOwnerStats(),
        api.getOwnerListings({ $top: '5' }),
      ]);
      setStats(statsData);
      setProperties(listingsData.value);
    } catch {
      setStats(null);
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const ownerStats = [
    { label: 'Anúncios Ativos', value: stats?.totalProperties ?? 0, icon: Building2, color: 'bg-blue-500' },
    { label: 'Visualizações Totais', value: stats?.totalViews ?? 0, icon: Eye, color: 'bg-amber-500' },
    { label: 'Contactos', value: stats?.totalContacts ?? 0, icon: MessageSquare, color: 'bg-emerald-500' },
    { label: 'Em Destaque', value: stats?.featuredCount ?? 0, icon: Star, color: 'bg-accent' },
  ];

  return (
    <div className="min-h-screen bg-cream-100">
      <Sidebar role="proprietario" userName={user?.name || 'Proprietário'} userRole="Proprietário" />
      <div className="lg:ml-64">
        <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="font-serif text-heading-1 text-foreground">Área do Proprietário</h1>
            <p className="text-body text-foreground-muted mt-1">Desempenho e gestão dos seus anúncios</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {ownerStats.map((s) => (
              <div key={s.label} className="bg-surface-elevated rounded-2xl border border-border shadow-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-9 h-9 rounded-lg ${s.color}/10 flex items-center justify-center`}>
                    <s.icon className={`w-4.5 h-4.5 ${s.color.replace('bg-', 'text-').replace('accent', 'text-accent')}`} />
                  </div>
                  <span className="text-caption text-foreground-muted">{s.label}</span>
                </div>
                <p className="font-serif text-heading-1 text-foreground">
                  {isLoading ? '—' : s.value.toLocaleString('pt-PT')}
                </p>
              </div>
            ))}
          </div>

          {/* Quick Actions + Listings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-surface-elevated rounded-2xl border border-border shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-heading-3 text-foreground">Os Meus Anúncios</h3>
                <Link
                  href="/painel/proprietario/imoveis"
                  className="text-sm text-olive-600 hover:underline"
                >
                  Ver todos
                </Link>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-olive-200 border-t-olive-500 rounded-full animate-spin" />
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-12 text-foreground-muted">
                  <Building2 className="w-10 h-10 mx-auto mb-3 text-foreground-muted/50" />
                  <p className="text-body mb-4">Ainda não tem anúncios publicados</p>
                  <Link
                    href="/painel/proprietario/imoveis/novo"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-olive-500 text-white rounded-xl text-sm font-medium hover:bg-olive-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Criar primeiro anúncio
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {properties.map((p) => (
                    <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl border border-border hover:bg-cream-50 transition-colors">
                      <div className="w-14 h-14 rounded-xl bg-cream-200 flex items-center justify-center overflow-hidden shrink-0">
                        {p.images ? (
                          <img src={JSON.parse(p.images)[0]?.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-5 h-5 text-foreground-muted" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body text-foreground font-medium truncate">{p.title}</p>
                        <p className="text-caption text-foreground-muted">{p.city} · {p.typology}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-body text-foreground font-medium">
                          {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: p.currency || 'EUR', maximumFractionDigits: 0 }).format(Number(p.price))}
                        </p>
                        <div className="flex items-center justify-end gap-3 mt-1">
                          <span className="text-caption text-foreground-muted flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {p.viewCount || 0}
                          </span>
                          <span className="text-caption text-foreground-muted flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> {p.contactCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upgrades Panel */}
            <div className="space-y-6">
              <div className="bg-accent rounded-2xl p-6 text-white">
                <div className="p-2 bg-white/10 rounded-lg w-fit mb-4">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-heading-2 mb-2">Aumente a Visibilidade</h3>
                <p className="text-body text-white/80 leading-relaxed mb-4">
                  Destaque os seus imóveis e receba até 340% mais contactos qualificados.
                </p>
                <Link
                  href="/painel/proprietario/destaques"
                  className="block w-full py-3 bg-white text-accent text-center font-medium rounded-xl hover:bg-white/90 transition-colors"
                >
                  Ver Pacotes de Destaque
                </Link>
              </div>

              <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6">
                <h3 className="font-serif text-heading-3 text-foreground mb-4">Plano Gratuito</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-body">
                    <span className="text-foreground-muted">Anúncios usados</span>
                    <span className="font-medium text-foreground">{user?.freeListingsUsed || 0} / 3</span>
                  </div>
                  <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-olive-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, ((user?.freeListingsUsed || 0) / 3) * 100)}%` }}
                    />
                  </div>
                  <p className="text-caption text-foreground-muted">
                    {Math.max(0, 3 - (user?.freeListingsUsed || 0))} anúncios gratuitos restantes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
