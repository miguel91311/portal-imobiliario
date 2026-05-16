'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMarket, Market } from '@/context/market-context';
import { NavbarMarket } from '@/components/navbar-market';
import { FooterMarket } from '@/components/footer-market';
import { IMTJovemCalculator, IPUAngolaCalculator } from '@/components/calculators';
import { Search, Map, Shield, Calculator, TrendingUp, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { mockProperties } from '@/lib/data';

export function MarketHomePage({ market }: { market: Market }) {
  const { market: ctxMarket } = useMarket();
  const activeMarket = ctxMarket || market;

  const isPT = activeMarket === 'PT';
  const isAO = activeMarket === 'AO';

  const marketProperties = mockProperties.filter((p) => p.location.country === activeMarket);
  const featuredProperty = marketProperties[0];

  return (
    <main className="min-h-screen bg-cream-100">
      <NavbarMarket />

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="luxury-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-overline text-accent uppercase tracking-wider">
                  {isPT ? 'Portugal · Lançamento 2026' : 'Angola · Lançamento 2026'}
                </span>
              </div>

              <h1 className="font-serif text-display text-foreground leading-[1.1]">
                {isPT ? 'O futuro do imobiliário' : 'O futuro do imobiliário'}
                <span className="block text-gradient">
                  {isPT ? 'premium em Portugal' : 'premium em Angola'}
                </span>
              </h1>

              <p className="text-body-large text-foreground-muted max-w-lg leading-relaxed">
                {isPT
                  ? 'Lisboa, Porto e Cascais. Curadoria algorítmica, simulação IMT Jovem e avaliação preditiva para o mercado português.'
                  : 'Luanda, Benguela e Lubango. Curadoria algorítmica, simulação IPU/Sisa e avaliação preditiva para o mercado angolano.'}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link href={`/${activeMarket.toLowerCase()}/explorar`} className="btn-primary gap-2">
                  <Map className="w-4 h-4" />
                  Explorar Mapa
                </Link>
                <Link href="#simuladores" className="btn-ghost gap-2">
                  <Calculator className="w-4 h-4" />
                  Simular Impostos
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="text-center">
                  <p className="font-serif text-heading-1 text-olive-500">{marketProperties.length}</p>
                  <p className="text-caption text-foreground-muted">Propriedades Curadas</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-center">
                  <p className="font-serif text-heading-1 text-olive-500">{isPT ? '€' : 'Kz'}</p>
                  <p className="text-caption text-foreground-muted">Moeda local</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-center">
                  <p className="font-serif text-heading-1 text-olive-500">3</p>
                  <p className="text-caption text-foreground-muted">Painéis Operacionais</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-elevated">
                <Image
                  src={featuredProperty?.images[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'}
                  alt={featuredProperty?.title || 'Propriedade em destaque'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="p-4 bg-white/90 backdrop-blur-md rounded-xl">
                    <p className="text-overline text-foreground-muted uppercase">Em Destaque · {activeMarket}</p>
                    <p className="font-serif text-heading-3 text-foreground mt-1">{featuredProperty?.title || 'Moradia Premium'}</p>
                    <p className="text-body text-accent mt-0.5">
                      {isPT ? '€450.000' : '2 850 000 000 Kz'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-olive-200/30 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-20 bg-white border-y border-border">
        <div className="luxury-container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-heading-1 text-foreground mb-4">Porque somos diferentes</h2>
            <p className="text-body-large text-foreground-muted">
              Onde os portais de massa falham, nós criamos valor através de tecnologia, 
              curadoria e transparência fiscal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: 'Pesquisa Colaborativa',
                desc: 'Partilhe propriedades com cônjuges, Family Offices e advogados em tempo real. Sem perda de contexto.',
              },
              {
                icon: Shield,
                title: 'Anti-Fraude por IA',
                desc: 'Deteção de deepfakes, validação documental biométrica e triagem de ghost listings em todos os anúncios.',
              },
              {
                icon: TrendingUp,
                title: 'Avaliação Preditiva (AVM)',
                desc: 'Modelos hedónicos que calculam o valor de mercado em segundos, com score de confiança e índice de walkability.',
              },
              {
                icon: Calculator,
                title: isPT ? 'Simulação IMT Jovem' : 'Simulação IPU/Sisa',
                desc: isPT
                  ? 'IMT Jovem calculado em tempo real, com lógica de compropriedade incluída. Para compradores até 35 anos.'
                  : 'IPU e Sisa calculados em tempo real, com lógica de isenção para estrangeiros e investimento.',
              },
              {
                icon: Map,
                title: 'Map-First Immersive',
                desc: 'A jornada começa no mapa, não numa grelha limitante. Contexto geográfico completo desde o primeiro segundo.',
              },
              {
                icon: Users,
                title: 'Agentic AI',
                desc: 'Assistentes autónomos que qualificam leads, agendam visitas e processam documentação preliminar.',
              },
            ].map((item) => (
              <div key={item.title} className="p-8 rounded-2xl bg-cream-50 border border-border hover:border-olive-200 hover:shadow-elevated transition-all duration-500 ease-luxury">
                <div className="w-12 h-12 rounded-xl bg-olive-500/10 flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6 text-olive-500" />
                </div>
                <h3 className="font-serif text-heading-3 text-foreground mb-3">{item.title}</h3>
                <p className="text-body text-foreground-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simuladores */}
      <section id="simuladores" className="py-20">
        <div className="luxury-container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-heading-1 text-foreground mb-4">Clareza Fiscal Imediata</h2>
            <p className="text-body-large text-foreground-muted">
              As nossas calculadoras convertem curiosidade em leads qualificados. 
              Simule antes de contactar o agente.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {isPT ? <IMTJovemCalculator /> : <IPUAngolaCalculator />}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-olive-500">
        <div className="luxury-container text-center">
          <h2 className="font-serif text-heading-1 text-white mb-6">
            Pronto para encontrar a sua propriedade?
          </h2>
          <p className="text-body-large text-white/70 max-w-xl mx-auto mb-10">
            Explore o nosso mapa interativo com propriedades premium em {isPT ? 'Portugal' : 'Angola'}, 
            curadas e validadas pela nossa equipa.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href={`/${activeMarket.toLowerCase()}/explorar`} className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-medium rounded-xl hover:bg-accent-dark transition-colors shadow-elevated">
              <Map className="w-5 h-5" />
              Explorar Propriedades
            </Link>
            <Link href="/auth/login" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors">
              <Users className="w-5 h-5" />
              Sou Agente
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-caption text-white/50">
            {[isPT ? 'IMPIC Certificado' : 'INOCOOP Validado', 'APIMA Validado', 'Cibersegurança ISO 27001', 'Dados encriptados'].map((badge) => (
              <span key={badge} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      <FooterMarket />
    </main>
  );
}
