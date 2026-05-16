import { Navbar } from '@/components/navbar';
import { FooterSimple } from '@/components/footer-simple';
import { Check, Building2, Zap } from 'lucide-react';
import Link from 'next/link';

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
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Para agentes em crescimento',
    price: 35,
    listings: 10,
    features: ['Até 10 imóveis', 'Dashboard completo', 'Leads ilimitados', 'Relatórios avançados', 'Inteligência de mercado'],
    color: 'bg-olive-500',
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

export default function PlanosPage() {
  return (
    <div className="min-h-screen bg-cream-100">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">
            Planos para Profissionais
          </h1>
          <p className="text-body text-foreground-muted max-w-2xl mx-auto">
            Escolhe o plano que melhor se adapta à tua carteira. Todos os planos incluem acesso à área privada, chat integrado e leads ilimitados.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border ${plan.popular ? 'border-olive-500 shadow-lg' : 'border-border shadow-card'} p-6 flex flex-col relative`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-olive-500 text-white text-xs font-medium rounded-full">
                  Mais Popular
                </div>
              )}
              <div className="mb-4">
                <h3 className="font-serif text-2xl text-foreground">{plan.name}</h3>
                <p className="text-body text-foreground-muted">{plan.description}</p>
              </div>
              <div className="mb-4">
                <span className="font-serif text-4xl text-foreground">{plan.price}€</span>
                <span className="text-caption text-foreground-muted">/mês</span>
              </div>
              <div className="mb-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white ${plan.color}`}>
                  <Building2 className="w-3 h-3" />
                  {plan.listings} imóveis
                </span>
              </div>
              <ul className="space-y-2 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-body text-foreground">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/registo/agente?plano=${plan.id}`}
                className={`w-full py-3 rounded-xl font-medium text-center transition-colors ${
                  plan.popular
                    ? 'bg-olive-500 text-white hover:bg-olive-600'
                    : 'bg-cream-200 text-foreground hover:bg-cream-300'
                }`}
              >
                Começar com {plan.name}
              </Link>
            </div>
          ))}
        </div>

        {/* Feature sprint */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-8 mb-16">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="p-3 bg-amber-500 rounded-xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-heading-3 text-foreground mb-1">Destaque Sprint — €2/semana</h3>
              <p className="text-body text-foreground-muted leading-relaxed max-w-2xl">
                Não precisas de mudar de plano para destacar um imóvel. Compra créditos de destaque e ativa
                quando quiseres. O pino no mapa fica dourado, chamando a atenção dos compradores.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-body text-foreground-muted mb-4">
            Ainda não tens conta? Regista-te gratuitamente e publica os teus primeiros 3 anúncios sem pagar nada.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/registo/agente"
              className="px-8 py-3 bg-olive-500 text-white rounded-xl font-medium hover:bg-olive-600 transition-colors"
            >
              Registar como Agente
            </Link>
            <Link
              href="/publicar"
              className="px-8 py-3 border border-border bg-white text-foreground rounded-xl font-medium hover:bg-cream-200 transition-colors"
            >
              Publicar Anúncio Grátis
            </Link>
          </div>
        </div>
      </main>

      <FooterSimple />
    </div>
  );
}
