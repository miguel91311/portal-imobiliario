import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Building2, MapPin, Shield, TrendingUp } from 'lucide-react';

export const metadata = {
  title: 'Portal Premium — Escolha o seu Mercado',
  description: 'Imobiliário premium em Portugal e Angola. Escolha o mercado e explore propriedades selecionadas.',
};

export default function MarketSelectorPage() {
  const markets = [
    {
      code: 'pt',
      name: 'Portugal',
      flag: '🇵🇹',
      currency: 'EUR',
      locale: 'pt-PT',
      image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80',
      accent: 'from-emerald-900/80 to-emerald-950/90',
      stats: { properties: '3 imóveis curados', cities: 'Lisboa · Porto · Cascais' },
      features: ['IMT Jovem em tempo real', 'Avaliação AMI', 'Crédito habitação'],
      cta: 'Explorar Portugal',
    },
    {
      code: 'ao',
      name: 'Angola',
      flag: '🇦🇴',
      currency: 'AOA',
      locale: 'pt-AO',
      image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&q=80',
      accent: 'from-amber-900/80 to-amber-950/90',
      stats: { properties: '3 imóveis curados', cities: 'Luanda · Benguela · Lubango' },
      features: ['IPU & Sisa calculados', 'Validação INOCOOP', 'Financiamento BNA'],
      cta: 'Explorar Angola',
    },
  ];

  return (
    <main className="min-h-screen bg-cream-100 flex flex-col">
      {/* Header brand */}
      <header className="absolute top-0 left-0 right-0 z-20 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-olive-500 flex items-center justify-center">
              <span className="text-white font-serif text-xl font-bold">P</span>
            </div>
            <span className="font-serif text-heading-2 text-olive-500 tracking-tight">Portal</span>
            <span className="font-serif text-heading-2 text-accent tracking-tight">Premium</span>
          </div>
          <Link href="/publicar" className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-olive-500 text-white text-caption font-medium hover:bg-olive-600 transition-colors">
            <span>Publicar anúncio</span>
          </Link>
        </div>
      </header>

      {/* Hero text */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-overline text-accent uppercase tracking-wider">Ecossistema Transfronteiriço</span>
          </div>
          <h1 className="font-serif text-display text-foreground leading-[1.1] mb-6">
            Escolha o seu
            <span className="block text-gradient">mercado imobiliário</span>
          </h1>
          <p className="text-body-large text-foreground-muted max-w-lg mx-auto leading-relaxed">
            Cada mercado tem as suas próprias regras fiscais, moeda e certificações. 
            Selecione o país onde procura a sua próxima propriedade.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {markets.map((m) => (
            <Link
              key={m.code}
              href={`/${m.code}`}
              className="group relative overflow-hidden rounded-3xl shadow-elevated hover:shadow-2xl transition-all duration-500 ease-luxury"
            >
              {/* Background image */}
              <div className="relative aspect-[4/3] md:aspect-[3/4] lg:aspect-[4/3]">
                <Image
                  src={m.image}
                  alt={m.name}
                  fill
                  className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${m.accent}`} />

                {/* Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-between text-white">
                  <div>
                    <span className="text-5xl mb-4 block">{m.flag}</span>
                    <h2 className="font-serif text-heading-1 text-white mb-2">{m.name}</h2>
                    <p className="text-body-large text-white/80">{m.stats.cities}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <Building2 className="w-4 h-4" />
                      <span>{m.stats.properties}</span>
                    </div>
                    <ul className="space-y-2">
                      {m.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                          <Shield className="w-3.5 h-3.5 text-accent" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center gap-2 pt-2 text-white font-medium group-hover:translate-x-1 transition-transform">
                      <span>{m.cta}</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-caption text-foreground-muted">
          {[
            { icon: Shield, text: 'Dados encriptados' },
            { icon: TrendingUp, text: 'Avaliação preditiva AVM' },
            { icon: MapPin, text: 'Mapa interativo' },
          ].map(({ icon: Icon, text }) => (
            <span key={text} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-olive-500" />
              {text}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-caption text-foreground-muted border-t border-border">
        <p>© 2026 Portal Premium. Portugal & Angola · Todos os direitos reservados.</p>
      </footer>
    </main>
  );
}
