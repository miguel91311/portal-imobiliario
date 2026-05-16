'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import {
  Building2, Eye, Phone, Search, MapPin, Trash2, Plus,
  Star, CheckCircle2, Minus
} from 'lucide-react';

export default function OwnerPropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getOwnerListings();
      setProperties(data.value);
    } catch {
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProperty = async (id: string) => {
    if (!confirm('Tem certeza que deseja eliminar este anúncio?')) return;
    try {
      await api.deleteProperty(id);
      loadData();
    } catch {
      alert('Erro ao eliminar anúncio');
    }
  };

  const filteredProperties = properties.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.city?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'sold': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      case 'rented': return <CheckCircle2 className="w-4 h-4 text-purple-500" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['owner', 'admin']}>
      <div className="min-h-screen bg-cream-100">
        <Sidebar role="proprietario" userName={user?.name || 'Proprietário'} userRole="Proprietário" />
        <div className="lg:ml-64">
          <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="font-serif text-heading-1 text-foreground">Os Meus Anúncios</h1>
                <p className="text-body text-foreground-muted mt-1">Gerencie os seus imóveis publicados</p>
              </div>
              <Link
                href="/painel/proprietario/imoveis/novo"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-olive-500 text-white rounded-xl text-sm font-medium hover:bg-olive-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Novo Anúncio
              </Link>
            </div>

            {/* Search */}
            <div className="relative max-w-md mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
              <input
                type="text"
                placeholder="Pesquisar anúncios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20"
              />
            </div>

            {/* Table */}
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
                    {filteredProperties.map((property) => (
                      <tr key={property.id} className="border-b border-border last:border-0 hover:bg-cream-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-cream-200 flex items-center justify-center overflow-hidden">
                              {property.images ? (
                                <img src={JSON.parse(property.images)[0]?.url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Building2 className="w-5 h-5 text-foreground-muted" />
                              )}
                            </div>
                            <div>
                              <p className="text-body text-foreground font-medium">{property.title}</p>
                              <p className="text-caption text-foreground-muted">{property.typology} · {property.sqm}m²</p>
                              {property.featured && (
                                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-xs">
                                  <Star className="w-3 h-3" />
                                  Destaque
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
                            {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: property.currency || 'EUR', maximumFractionDigits: 0 }).format(Number(property.price))}
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
                            {property.status === 'available' ? 'Ativo' : property.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => deleteProperty(property.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredProperties.length === 0 && (
                  <div className="text-center py-12 text-foreground-muted">
                    <Building2 className="w-10 h-10 mx-auto mb-3 text-foreground-muted/50" />
                    <p className="text-body mb-2">Ainda não tem anúncios publicados</p>
                    <Link href="/painel/proprietario/imoveis/novo" className="text-sm text-olive-600 hover:underline">
                      Criar primeiro anúncio
                    </Link>
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
