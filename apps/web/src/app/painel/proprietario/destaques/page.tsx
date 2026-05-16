'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Star, Zap, Check } from 'lucide-react';

export default function OwnerFeaturedPage() {
  const { user } = useAuth();
  const [packages, setPackages] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [myPlan, setMyPlan] = useState<any>(null);
  const [creditQty, setCreditQty] = useState(1);
  const [buyingCredits, setBuyingCredits] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pkgData, propData, plan] = await Promise.all([
        api.getFeaturedPackages(),
        api.getOwnerListings(),
        api.getMyPlan(),
      ]);
      setPackages(pkgData.value);
      setProperties(propData.value);
      setMyPlan(plan);
      if (propData.value.length > 0) setSelectedProperty(propData.value[0].id);
    } catch {
      setPackages([]);
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const purchase = async (packageId: string) => {
    if (!selectedProperty) {
      alert('Selecione um imóvel primeiro');
      return;
    }
    setPurchasing(packageId);
    try {
      const origin = window.location.origin;
      const session = await api.createStripeCheckout({
        type: 'featured_package',
        packageId,
        propertyId: selectedProperty,
        successUrl: `${origin}/painel/proprietario/destaques?success=1`,
        cancelUrl: `${origin}/painel/proprietario/destaques?canceled=1`,
      });
      if (session.url) {
        window.location.href = session.url;
      } else {
        alert('Erro ao iniciar pagamento. Tente novamente.');
      }
    } catch (err: any) {
      alert(err?.data?.error || 'Erro ao iniciar checkout');
    } finally {
      setPurchasing(null);
    }
  };

  const activateSprint = async () => {
    if (!selectedProperty) {
      alert('Selecione um imóvel primeiro');
      return;
    }
    setPurchasing('sprint');
    try {
      await api.purchaseSprint({ propertyId: selectedProperty });
      alert('Destaque Sprint ativado por 7 dias!');
      loadData();
    } catch (err: any) {
      alert(err?.data?.error || 'Erro ao ativar destaque');
    } finally {
      setPurchasing(null);
    }
  };

  const handleBuyCredits = async () => {
    if (creditQty < 1) return;
    setBuyingCredits(true);
    try {
      const origin = window.location.origin;
      const session = await api.createStripeCheckout({
        type: 'credits',
        quantity: creditQty,
        successUrl: `${origin}/painel/proprietario/destaques?success=1`,
        cancelUrl: `${origin}/painel/proprietario/destaques?canceled=1`,
      });
      if (session.url) {
        window.location.href = session.url;
      } else {
        alert('Erro ao iniciar pagamento. Tente novamente.');
      }
    } catch (err: any) {
      alert(err?.data?.error || 'Erro ao iniciar checkout');
    } finally {
      setBuyingCredits(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['owner', 'admin']}>
      <div className="min-h-screen bg-cream-100">
        <Sidebar role="proprietario" userName={user?.name || 'Proprietário'} userRole="Proprietário" />
        <div className="lg:ml-64">
          <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="font-serif text-heading-1 text-foreground">Destaques & Upgrades</h1>
              <p className="text-body text-foreground-muted mt-1">Aumente a visibilidade dos seus anúncios</p>
            </div>

            {/* Property Selector */}
            <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6 mb-8">
              <label className="block text-overline text-foreground-muted uppercase tracking-wider mb-2">Selecione o imóvel</label>
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full max-w-md px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} {p.featured ? '(já em destaque)' : ''}
                  </option>
                ))}
                {properties.length === 0 && (
                  <option value="">Nenhum imóvel disponível</option>
                )}
              </select>
            </div>

            {/* Packages */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-3 border-olive-200 border-t-olive-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6 flex flex-col"
                  >
                    <div className="mb-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
                        <Star className="w-5 h-5 text-amber-600" />
                      </div>
                      <h3 className="font-serif text-heading-2 text-foreground">{pkg.name}</h3>
                      <p className="text-body text-foreground-muted mt-1">{pkg.description}</p>
                    </div>

                    <div className="mb-4">
                      <span className="font-serif text-3xl text-foreground">{(pkg.price / 100).toFixed(2)}€</span>
                      <span className="text-caption text-foreground-muted"> / {pkg.durationDays} dias</span>
                    </div>

                    <ul className="space-y-2 mb-6 flex-1">
                      {(pkg.features || []).map((f: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-body text-foreground">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                      {(!pkg.features || pkg.features.length === 0) && (
                        <li className="flex items-center gap-2 text-body text-foreground">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          Destaque nas pesquisas
                        </li>
                      )}
                    </ul>

                    <button
                      onClick={() => purchase(pkg.id)}
                      disabled={purchasing === pkg.id || !selectedProperty || properties.length === 0}
                      className="w-full py-3 bg-olive-500 text-white rounded-xl font-medium hover:bg-olive-600 transition-colors disabled:opacity-50"
                    >
                      {purchasing === pkg.id ? 'A redirecionar...' : 'Ativar Destaque'}
                    </button>
                  </div>
                ))}

                {/* Sprint card */}
                <div className="bg-accent rounded-2xl p-6 text-white flex flex-col">
                  <div className="mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-serif text-heading-2">Sprint</h3>
                    <p className="text-body text-white/80 mt-1">Destaque rápido por 1 semana</p>
                  </div>
                  <div className="mb-4">
                    <span className="font-serif text-3xl">2.00€</span>
                    <span className="text-caption text-white/70"> / semana</span>
                  </div>
                  <p className="text-sm text-white/70 mb-4">
                    Créditos disponíveis: <strong>{myPlan?.featuredCredits ?? 0}</strong>
                  </p>
                  <ul className="space-y-2 mb-6 flex-1">
                    <li className="flex items-center gap-2 text-body">
                      <Check className="w-4 h-4 shrink-0" />
                      Topo das pesquisas
                    </li>
                    <li className="flex items-center gap-2 text-body">
                      <Check className="w-4 h-4 shrink-0" />
                      Pin dourado no mapa
                    </li>
                    <li className="flex items-center gap-2 text-body">
                      <Check className="w-4 h-4 shrink-0" />
                      Contactos qualificados
                    </li>
                  </ul>
                  <button
                    onClick={activateSprint}
                    disabled={purchasing === 'sprint' || !selectedProperty || properties.length === 0 || (myPlan?.featuredCredits ?? 0) < 1}
                    className="w-full py-3 bg-white text-accent rounded-xl font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
                  >
                    {purchasing === 'sprint' ? 'A processar...' : 'Ativar Sprint (1 crédito)'}
                  </button>
                  <div className="border-t border-white/20 pt-4 mt-4">
                    <label className="block text-sm text-white/70 mb-2">Comprar créditos</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={creditQty}
                        onChange={(e) => setCreditQty(Math.max(1, Math.min(100, Number(e.target.value))))}
                        className="w-20 px-3 py-2 rounded-xl border-0 bg-white/10 text-white text-center focus:outline-none focus:ring-2 focus:ring-white/30"
                      />
                      <span className="text-sm text-white/70">× €2 = <strong>€{creditQty * 2}</strong></span>
                      <button
                        onClick={handleBuyCredits}
                        disabled={buyingCredits}
                        className="flex-1 py-2 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-colors disabled:opacity-50"
                      >
                        {buyingCredits ? 'A redirecionar...' : 'Comprar'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
