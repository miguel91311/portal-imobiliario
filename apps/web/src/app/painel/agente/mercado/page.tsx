'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';
import {
  TrendingUp, MapPin, Building2, Users, ArrowUpRight, ArrowDownRight, Minus,
  Search
} from 'lucide-react';

export default function MarketIntelligencePage() {
  const { user } = useAuth();
  const [city, setCity] = useState('Lisboa');
  const [country, setCountry] = useState('PT');
  const [intelligence, setIntelligence] = useState<any>(null);
  const [trend, setTrend] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [city, country]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [intel, tr] = await Promise.all([
        api.getMarketIntelligence({ city, country }),
        api.getPriceTrend({ city, country }),
      ]);
      setIntelligence(intel);
      setTrend(tr);
    } catch {
      setIntelligence(null);
      setTrend(null);
    } finally {
      setIsLoading(false);
    }
  };

  const totalListings = intelligence?.neighborhoods.reduce((sum: number, n: any) => sum + n.listings, 0) || 0;
  const totalLeads = intelligence?.neighborhoods.reduce((sum: number, n: any) => sum + n.leads, 0) || 0;
  const avgPricePerSqm = intelligence?.neighborhoods.length > 0
    ? Math.round(intelligence.neighborhoods.reduce((sum: number, n: any) => sum + n.avgPricePerSqm, 0) / intelligence.neighborhoods.length)
    : 0;
  const topTypology = intelligence?.typologies?.sort((a: any, b: any) => b.count - a.count)[0];

  const statsCards = [
    { label: 'Listings Ativos', value: totalListings, icon: Building2, color: 'bg-blue-500' },
    { label: 'Leads', value: totalLeads, icon: Users, color: 'bg-amber-500' },
    { label: 'Preço Médio/m²', value: `${avgPricePerSqm.toLocaleString('pt-PT')}€`, icon: TrendingUp, color: 'bg-emerald-500' },
    { label: 'Tipologia Top', value: topTypology?.typology || '—', icon: MapPin, color: 'bg-purple-500' },
  ];

  return (
    <ProtectedRoute allowedRoles={['admin', 'agent']}>
      <div className="min-h-screen bg-cream-100">
        <Sidebar role="agente" userName={user?.name || 'Agente'} userRole="Agente Imobiliário" />
        <div className="lg:ml-64">
          <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="font-serif text-heading-1 text-foreground">Inteligência de Mercado</h1>
                <p className="text-body text-foreground-muted mt-1">Análise de preços, tendências e comparáveis</p>
              </div>
              <div className="flex gap-3">
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20"
                >
                  <option value="PT">Portugal</option>
                  <option value="AO">Angola</option>
                </select>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Cidade"
                  className="px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-3 border-olive-200 border-t-olive-500 rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Stats */}
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
                  {/* Neighborhood Table */}
                  <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6">
                    <h3 className="font-serif text-heading-3 text-foreground mb-4">Preços por Bairro</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left text-overline text-foreground-muted uppercase tracking-wider px-4 py-3">Bairro</th>
                            <th className="text-right text-overline text-foreground-muted uppercase tracking-wider px-4 py-3">Preço/m²</th>
                            <th className="text-right text-overline text-foreground-muted uppercase tracking-wider px-4 py-3">Listings</th>
                            <th className="text-right text-overline text-foreground-muted uppercase tracking-wider px-4 py-3">Leads</th>
                            <th className="text-center text-overline text-foreground-muted uppercase tracking-wider px-4 py-3">Tend.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {intelligence?.neighborhoods?.map((n: any) => (
                            <tr key={n.neighborhood} className="border-b border-border last:border-0 hover:bg-cream-50/50">
                              <td className="px-4 py-3 text-body text-foreground font-medium">{n.neighborhood}</td>
                              <td className="px-4 py-3 text-right text-body text-foreground">{n.avgPricePerSqm.toLocaleString('pt-PT')}€</td>
                              <td className="px-4 py-3 text-right text-caption text-foreground-muted">{n.listings}</td>
                              <td className="px-4 py-3 text-right text-caption text-foreground-muted">{n.leads}</td>
                              <td className="px-4 py-3 text-center">
                                {n.trend > 0 ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
                                    <ArrowUpRight className="w-3.5 h-3.5" /> +{n.trend}%
                                  </span>
                                ) : n.trend < 0 ? (
                                  <span className="inline-flex items-center gap-1 text-red-600 text-xs font-medium">
                                    <ArrowDownRight className="w-3.5 h-3.5" /> {n.trend}%
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-foreground-muted text-xs">
                                    <Minus className="w-3.5 h-3.5" /> 0%
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {(!intelligence?.neighborhoods || intelligence.neighborhoods.length === 0) && (
                        <p className="text-center py-8 text-foreground-muted">Sem dados para esta cidade</p>
                      )}
                    </div>
                  </div>

                  {/* Price Trend Chart */}
                  <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6">
                    <h3 className="font-serif text-heading-3 text-foreground mb-4">Tendência de Preços</h3>
                    {trend?.trends?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={trend.trends}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                          <Tooltip formatter={(v: any) => `${Number(v).toLocaleString('pt-PT')}€`} />
                          <Line type="monotone" dataKey="avgPrice" stroke="#059669" strokeWidth={2} dot={{ r: 4 }} name="Preço Médio" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center py-20 text-foreground-muted">Sem dados históricos suficientes</p>
                    )}
                  </div>
                </div>

                {/* Typology Distribution */}
                <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6">
                  <h3 className="font-serif text-heading-3 text-foreground mb-4">Distribuição por Tipologia</h3>
                  {intelligence?.typologies?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={intelligence.typologies}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="typology" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#059669" radius={[6, 6, 0, 0]} name="Listings" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center py-12 text-foreground-muted">Sem dados</p>
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
