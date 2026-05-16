'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Star, Zap, Crown, Check, Building2 } from 'lucide-react';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Ideal para agentes independentes',
    price: 20,
    listings: 5,
    features: ['Até 5 imóveis', 'Dashboard completo', 'Leads ilimitados', 'Relatórios básicos'],
    color: 'bg-blue-500',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Para agentes em crescimento',
    price: 35,
    listings: 10,
    features: ['Até 10 imóveis', 'Dashboard completo', 'Leads ilimitados', 'Relatórios avançados', 'Inteligência de mercado'],
    color: 'bg-accent',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Para grandes carteiras',
    price: 60,
    listings: 30,
    features: ['Até 30 imóveis', 'Dashboard completo', 'Leads ilimitados', 'Relatórios avançados', 'Inteligência de mercado', 'API access'],
    color: 'bg-purple-500',
  },
];

export default function AgentDestaquesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [myPlan, setMyPlan] = useState<any>(null);
  const [creditQty, setCreditQty] = useState(1);
  const [buyingCredits, setBuyingCredits] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [data, plan] = await Promise.all([
        api.getProperties({ agentId: user?.id || '' }),
        api.getMyPlan(),
      ]);
      setProperties(data.value);
      setMyPlan(plan);
      if (data.value.length > 0) setSelectedProperty(data.value[0].id);
    } catch {
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const activateSprint = async () => {
    if (!selectedProperty) return;
    setActivating(true);
    try {
      await api.purchaseSprint({ propertyId: selectedProperty });
      alert('Destaque Sprint ativado por 7 dias!');
      loadData();
    } catch (err: any) {
      alert(err?.data?.error || 'Erro ao ativar destaque');
    } finally {
      setActivating(false);
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
        successUrl: `${origin}/painel/agente/destaques?success=1`,
        cancelUrl: `${origin}/painel/agente/destaques?canceled=1`,
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
    <ProtectedRoute allowedRoles={['admin', 'agent']}>
      <div className="min-h-screen bg-cream-100">
        <Sidebar role="agente" userName={user?.name || 'Agente'} userRole="Agente Imobiliário" />
        <div className="lg:ml-64">
          <div className="px-6 lg:px-10 py-8 max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="font-serif text-heading-1 text-foreground">Planos & Destaques</h1>
              <p className="text-body text-foreground-muted mt-1">Escolha o plano ideal e destaque os seus imóveis</p>
            </div>

            {/* Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-surface-elevated rounded-2xl border ${plan.popular ? 'border-accent shadow-lg' : 'border-border shadow-card'} p-6 flex flex-col relative`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-white text-xs font-medium rounded-full">
                      Mais Popular
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="font-serif text-heading-2 text-foreground">{plan.name}</h3>
                    <p className="text-body text-foreground-muted">{plan.description}</p>
                  </div>
                  <div className="mb-4">
                    <span className="font-serif text-3xl text-foreground">{plan.price}€</span>
                    <span className="text-caption text-foreground-muted">/mês</span>
                  </div>
                  <div className="mb-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white ${plan.color}`}>
                      <Building2 className="w-3 h-3" />
                      {plan.listings} imóveis
                    </span>
                  </div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-body text-foreground">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="/painel/agente/planos"
                    className="w-full py-3 bg-olive-500 text-white rounded-xl font-medium hover:bg-olive-600 transition-colors text-center"
                  >
                    Escolher {plan.name}
                  </a>
                </div>
              ))}
            </div>

            {/* Sprint 24h */}
            <div className="bg-accent rounded-2xl p-8 text-white mb-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <div className="p-2 bg-white/10 rounded-lg w-fit mb-4">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-heading-2 mb-2">Sprint — Destaque €2/semana</h3>
                  <p className="text-body text-white/80 leading-relaxed max-w-lg">
                    Destaque o seu imóvel no topo das pesquisas por 1 semana. Apenas €2 por imóvel.
                    O pino no mapa fica dourado e maior, chamando imediatamente a atenção dos compradores.
                  </p>
                  <p className="text-sm text-white/70 mt-2">
                    Créditos disponíveis: <strong>{myPlan?.featuredCredits ?? 0}</strong>
                  </p>
                </div>
                <div className="w-full md:w-auto min-w-[280px] space-y-4">
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Selecione o imóvel</label>
                    <select
                      value={selectedProperty}
                      onChange={(e) => setSelectedProperty(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border-0 bg-white/10 text-white mb-3 focus:outline-none focus:ring-2 focus:ring-white/30"
                    >
                      {properties.map((p) => (
                        <option key={p.id} value={p.id} className="text-foreground">
                          {p.title} {p.featured ? '(já em destaque)' : ''}
                        </option>
                      ))}
                      {properties.length === 0 && (
                        <option value="">Nenhum imóvel disponível</option>
                      )}
                    </select>
                    <button
                      onClick={activateSprint}
                      disabled={activating || !selectedProperty || properties.length === 0 || (myPlan?.featuredCredits ?? 0) < 1}
                      className="w-full py-3 bg-white text-accent rounded-xl font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
                    >
                      {activating ? 'A processar...' : 'Ativar Destaque (1 crédito)'}
                    </button>
                  </div>
                  <div className="border-t border-white/20 pt-4">
                    <label className="block text-sm text-white/70 mb-2">Comprar créditos de destaque</label>
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
            </div>

            {/* Current featured properties */}
            <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6">
              <h3 className="font-serif text-heading-3 text-foreground mb-4">Imóveis em Destaque</h3>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-olive-200 border-t-olive-500 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {properties.filter((p) => p.featured).map((p) => (
                    <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl border border-amber-200 bg-amber-50">
                      <Star className="w-5 h-5 text-amber-500 shrink-0" />
                      <div className="flex-1">
                        <p className="text-body text-foreground font-medium">{p.title}</p>
                        <p className="text-caption text-foreground-muted">{p.city}</p>
                      </div>
                      <span className="text-caption text-amber-700 font-medium">
                        Até {p.featuredUntil ? new Date(p.featuredUntil).toLocaleDateString('pt-PT') : '—'}
                      </span>
                    </div>
                  ))}
                  {properties.filter((p) => p.featured).length === 0 && (
                    <p className="text-body text-foreground-muted text-center py-4">Nenhum imóvel em destaque</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
