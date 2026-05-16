'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Check, Building2, Zap, Crown, Star, ExternalLink } from 'lucide-react';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Ideal para agentes independentes',
    price: 20,
    listings: 5,
    features: ['Até 5 imóveis', 'Dashboard completo', 'Leads ilimitados', 'Relatórios básicos'],
    color: 'bg-blue-500',
    borderColor: 'border-blue-200',
    shadowColor: 'shadow-blue-100',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Para agentes em crescimento',
    price: 35,
    listings: 10,
    features: ['Até 10 imóveis', 'Dashboard completo', 'Leads ilimitados', 'Relatórios avançados', 'Inteligência de mercado'],
    color: 'bg-accent',
    borderColor: 'border-accent',
    shadowColor: 'shadow-accent/10',
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
    borderColor: 'border-purple-200',
    shadowColor: 'shadow-purple-100',
  },
];

export default function AgentPlanosPage() {
  const { user } = useAuth();
  const [myPlan, setMyPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    setIsLoading(true);
    try {
      const plan = await api.getMyPlan();
      setMyPlan(plan);
    } catch {
      setMyPlan(null);
    } finally {
      setIsLoading(false);
    }
  };

  const upgradePlan = async (planId: string) => {
    setUpgrading(planId);
    try {
      const origin = window.location.origin;
      const session = await api.createStripeCheckout({
        type: 'plan',
        planId,
        successUrl: `${origin}/painel/agente/planos?success=1`,
        cancelUrl: `${origin}/painel/agente/planos?canceled=1`,
      });
      if (session.url) {
        window.location.href = session.url;
      } else {
        alert('Erro ao iniciar pagamento. Tente novamente.');
      }
    } catch (err: any) {
      alert(err?.data?.error || 'Erro ao iniciar checkout');
    } finally {
      setUpgrading(null);
    }
  };

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const portal = await api.createStripePortal();
      if (portal.url) {
        window.location.href = portal.url;
      }
    } catch (err: any) {
      alert(err?.data?.error || 'Erro ao abrir portal de faturação');
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'agent']}>
      <div className="min-h-screen bg-cream-100">
        <Sidebar role="agente" userName={user?.name || 'Agente'} userRole="Agente Imobiliário" />
        <div className="lg:ml-64">
          <div className="px-6 lg:px-10 py-8 max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="font-serif text-heading-1 text-foreground">Planos & Preços</h1>
              <p className="text-body text-foreground-muted mt-1">Escolha o plano ideal para a sua carteira</p>
            </div>

            {/* Current plan summary */}
            <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6 mb-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-heading-3 text-foreground">Plano Atual</h3>
                {myPlan?.planType !== 'free' && (
                  <button
                    onClick={openPortal}
                    disabled={portalLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-olive-600 bg-olive-50 rounded-lg hover:bg-olive-100 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {portalLoading ? 'A abrir...' : 'Gerir Subscrição'}
                  </button>
                )}
              </div>
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-olive-200 border-t-olive-500 rounded-full animate-spin" />
                  <span className="text-body text-foreground-muted">A carregar...</span>
                </div>
              ) : myPlan ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-cream-100 rounded-xl">
                    <p className="text-caption text-foreground-muted mb-1">Plano</p>
                    <p className="font-serif text-heading-3 text-foreground">{myPlan.planName}</p>
                  </div>
                  <div className="p-4 bg-cream-100 rounded-xl">
                    <p className="text-caption text-foreground-muted mb-1">Anúncios</p>
                    <p className="font-serif text-heading-3 text-foreground">
                      {myPlan.listingsUsed} / {myPlan.listingLimit}
                    </p>
                  </div>
                  <div className="p-4 bg-cream-100 rounded-xl">
                    <p className="text-caption text-foreground-muted mb-1">Créditos Destaque</p>
                    <p className="font-serif text-heading-3 text-foreground">{myPlan.featuredCredits}</p>
                  </div>
                  <div className="p-4 bg-cream-100 rounded-xl">
                    <p className="text-caption text-foreground-muted mb-1">Preço/mês</p>
                    <p className="font-serif text-heading-3 text-foreground">€{myPlan.planPrice}</p>
                  </div>
                </div>
              ) : (
                <p className="text-body text-foreground-muted">Não foi possível carregar o plano atual.</p>
              )}
            </div>

            {/* Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {PLANS.map((plan) => {
                const isCurrent = myPlan?.planType === plan.id;
                return (
                  <div
                    key={plan.id}
                    className={`bg-surface-elevated rounded-2xl border ${plan.popular ? 'border-accent shadow-lg' : 'border-border shadow-card'} p-6 flex flex-col relative`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-white text-xs font-medium rounded-full">
                        Mais Popular
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute -top-3 right-4 px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full">
                        Atual
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
                    <button
                      onClick={() => upgradePlan(plan.id)}
                      disabled={upgrading === plan.id || isCurrent}
                      className={`w-full py-3 rounded-xl font-medium transition-colors ${
                        isCurrent
                          ? 'bg-emerald-100 text-emerald-700 cursor-default'
                          : 'bg-olive-500 text-white hover:bg-olive-600'
                      } disabled:opacity-70`}
                    >
                      {upgrading === plan.id ? 'A redirecionar...' : isCurrent ? 'Plano Ativo' : 'Escolher ' + plan.name}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Feature sprint */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="p-3 bg-amber-500 rounded-xl">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-heading-3 text-foreground mb-1">Destaque Sprint — €2/semana</h3>
                  <p className="text-body text-foreground-muted leading-relaxed max-w-2xl">
                    Não precisa de mudar de plano para destacar um imóvel. Compre créditos de destaque e ative
                    quando quiser. O pino no mapa fica dourado, chamando a atenção dos compradores.
                  </p>
                </div>
                <a
                  href="/painel/agente/destaques"
                  className="shrink-0 px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
                >
                  Gerir Destaques
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
