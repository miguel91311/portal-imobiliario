'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { api } from '@/lib/api';
import {
  Building2, Eye, Phone, TrendingUp, AlertTriangle, CheckCircle2,
  Trash2, Search, MapPin, Tag, ArrowUpRight, ArrowDownRight, Minus,
  Pencil
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PropertyManagementPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAlerts, setShowAlerts] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [propsData, alertsData] = await Promise.all([
        api.getProperties(),
        api.getAlerts().catch(() => ({ value: [] })),
      ]);
      setProperties(propsData.value);
      setAlerts(alertsData.value);
    } catch {
      setProperties([]);
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProperty = async (id: string) => {
    if (!confirm('Tem certeza que deseja eliminar este imóvel?')) return;
    try {
      await api.deleteProperty(id);
      loadData();
    } catch {
      alert('Erro ao eliminar imóvel');
    }
  };

  const filteredProperties = properties.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.city?.toLowerCase().includes(search.toLowerCase()) ||
    p.neighborhood?.toLowerCase().includes(search.toLowerCase())
  );

  const totalViews = properties.reduce((sum, p) => sum + (p.viewCount || 0), 0);
  const totalContacts = properties.reduce((sum, p) => sum + (p.contactCount || 0), 0);
  const avgPricePerSqm = properties.length > 0
    ? properties.reduce((sum, p) => sum + (p.price / (p.sqm || 1)), 0) / properties.length
    : 0;

  const getAlertForProperty = (propertyId: string) =>
    alerts.filter((a) => a.propertyId === propertyId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'sold': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      case 'rented': return <CheckCircle2 className="w-4 h-4 text-purple-500" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'agent']}>
      <div className="min-h-screen bg-cream-100">
        <Sidebar role="agente" userName="Agente" userRole="Agente Imobiliário" />
        <div className="lg:ml-64">
          <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="font-serif text-heading-1 text-foreground">Gestão de Imóveis</h1>
                <p className="text-body text-foreground-muted mt-1">Portfolio, métricas e alertas de anomalias</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Building2 className="w-4.5 h-4.5 text-blue-600" />
                  </div>
                  <span className="text-caption text-foreground-muted">Imóveis</span>
                </div>
                <p className="font-serif text-heading-1 text-foreground">{properties.length}</p>
              </div>
              <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Eye className="w-4.5 h-4.5 text-amber-600" />
                  </div>
                  <span className="text-caption text-foreground-muted">Visualizações</span>
                </div>
                <p className="font-serif text-heading-1 text-foreground">{totalViews}</p>
              </div>
              <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Phone className="w-4.5 h-4.5 text-emerald-600" />
                  </div>
                  <span className="text-caption text-foreground-muted">Contactos</span>
                </div>
                <p className="font-serif text-heading-1 text-foreground">{totalContacts}</p>
              </div>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && showAlerts && (
              <div className="mb-8 bg-amber-50/50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-heading-3 text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Alertas de Anomalias ({alerts.length})
                  </h3>
                  <button onClick={() => setShowAlerts(false)} className="text-caption text-amber-600 hover:underline">Ocultar</button>
                </div>
                <div className="space-y-2">
                  {alerts.slice(0, 5).map((alert, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-amber-100">
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                        alert.severity === 'high' ? 'bg-red-500' :
                        alert.severity === 'medium' ? 'bg-amber-500' :
                        'bg-blue-400'
                      }`} />
                      <div className="flex-1">
                        <p className="text-body text-foreground font-medium">{alert.propertyTitle}</p>
                        <p className="text-caption text-foreground-muted">{alert.message}</p>
                        <p className="text-caption text-amber-600 mt-0.5">💡 {alert.suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            <div className="relative max-w-md mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
              <input
                type="text"
                placeholder="Pesquisar imóveis..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20"
              />
            </div>

            {/* Properties Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-3 border-olive-200 border-t-olive-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="bg-surface-elevated rounded-2xl border border-border shadow-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-cream-50">
                      <th className="text-left text-overline text-foreground-muted uppercase tracking-wider px-6 py-4">Imóvel</th>
                      <th className="text-left text-overline text-foreground-muted uppercase tracking-wider px-6 py-4">Localização</th>
                      <th className="text-left text-overline text-foreground-muted uppercase tracking-wider px-6 py-4">Preço</th>
                      <th className="text-center text-overline text-foreground-muted uppercase tracking-wider px-6 py-4">Views</th>
                      <th className="text-center text-overline text-foreground-muted uppercase tracking-wider px-6 py-4">Leads</th>
                      <th className="text-left text-overline text-foreground-muted uppercase tracking-wider px-6 py-4">Status</th>
                      <th className="text-right text-overline text-foreground-muted uppercase tracking-wider px-6 py-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProperties.map((property) => {
                      const propertyAlerts = getAlertForProperty(property.id);
                      return (
                        <tr key={property.id} className="border-b border-border last:border-0 hover:bg-cream-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-cream-200 flex items-center justify-center overflow-hidden">
                                {property.images?.[0]?.url ? (
                                  <img src={property.images[0].url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <Building2 className="w-5 h-5 text-foreground-muted" />
                                )}
                              </div>
                              <div>
                                <p className="text-body text-foreground font-medium">{property.title}</p>
                                <p className="text-caption text-foreground-muted">{property.typology} · {property.sqm}m²</p>
                                {propertyAlerts.length > 0 && (
                                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-xs">
                                    <AlertTriangle className="w-3 h-3" />
                                    {propertyAlerts.length} alerta{propertyAlerts.length > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-body text-foreground">
                              <MapPin className="w-3.5 h-3.5 text-foreground-muted" />
                              {property.city}
                            </div>
                            <p className="text-caption text-foreground-muted">{property.neighborhood}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-body text-foreground font-medium">
                              {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: property.currency || 'EUR', maximumFractionDigits: 0 }).format(property.price)}
                            </p>
                            <p className="text-caption text-foreground-muted">
                              {property.sqm > 0 ? `${Math.round(property.price / property.sqm).toLocaleString('pt-PT')} ${property.currency}/m²` : '—'}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <Eye className="w-3.5 h-3.5 text-foreground-muted" />
                              <span className="text-body text-foreground">{property.viewCount || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-foreground-muted" />
                              <span className="text-body text-foreground">{property.contactCount || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-caption font-medium bg-emerald-50 text-emerald-700">
                              {getStatusIcon(property.status)}
                              {property.status === 'available' ? 'Disponível' : property.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => router.push(`/painel/agente/imoveis/editar?id=${property.id}`)}
                                className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                                title="Editar"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteProperty(property.id)}
                                className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredProperties.length === 0 && (
                  <div className="text-center py-12 text-foreground-muted">
                    <Building2 className="w-10 h-10 mx-auto mb-3 text-foreground-muted/50" />
                    <p className="text-body">Nenhum imóvel encontrado</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
