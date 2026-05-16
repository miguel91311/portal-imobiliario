'use client';

import { useMarket } from '@/context/market-context';
import { MARKET_CONFIG } from '@/lib/market';
import { Globe, Shield, Phone, MapPin } from 'lucide-react';

export function FooterMarket() {
  const { market } = useMarket();
  const config = MARKET_CONFIG[market];

  return (
    <footer className="bg-olive-500 text-white">
      <div className="luxury-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-white font-serif text-lg font-bold">P</span>
              </div>
              <span className="font-serif text-heading-3 text-white">Portal Premium</span>
              <span className="text-xl">{config.flag}</span>
            </div>
            <p className="text-white/70 text-body leading-relaxed max-w-md mb-4">
              Ecossistema de inteligência imobiliária premium. 
              Propriedades selecionadas em {config.name} com curadoria algorítmica e transparência fiscal.
            </p>
            <div className="space-y-2 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{config.supportPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{config.supportAddress}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-overline uppercase tracking-wider text-white/50 mb-4">Cidades</h4>
            <ul className="space-y-3 text-body text-white/80">
              {config.cities.map((city) => (
                <li key={city}>
                  <span className="hover:text-white transition-colors cursor-default">{city}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-overline uppercase tracking-wider text-white/50 mb-4">Plataforma</h4>
            <ul className="space-y-3 text-body text-white/80">
              <li><span className="hover:text-white transition-colors cursor-default">Para Compradores</span></li>
              <li><span className="hover:text-white transition-colors cursor-default">Para Agentes</span></li>
              <li><span className="hover:text-white transition-colors cursor-default">Para Proprietários</span></li>
              <li><span className="hover:text-white transition-colors cursor-default">API & Integrações</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-caption text-white/50">
            <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> {config.flag} {config.name}</span>
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> SSL · GDPR · {config.legalFramework.split('·')[0].trim()}</span>
          </div>
          <span className="text-caption text-white/50">© 2026 Portal Premium. {config.name} · Todos os direitos reservados.</span>
        </div>
      </div>
    </footer>
  );
}
