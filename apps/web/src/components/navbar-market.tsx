'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useMarket } from '@/context/market-context';
import { MARKET_CONFIG } from '@/lib/market';
import { Menu, X, Globe, User, LogOut, ArrowLeftRight, Heart, Bell } from 'lucide-react';

export function NavbarMarket() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { market, setMarket } = useMarket();
  const pathname = usePathname();
  const config = MARKET_CONFIG[market];

  const otherMarket = market === 'PT' ? 'AO' : 'PT';
  const basePath = `/${market.toLowerCase()}`;

  const switchMarket = () => {
    setMarket(otherMarket);
    const newPath = pathname.replace(`/${market.toLowerCase()}`, `/${otherMarket.toLowerCase()}`);
    window.location.href = newPath || `/${otherMarket.toLowerCase()}`;
  };

  const navLinks = [
    { label: 'Explorar', href: `${basePath}/explorar` },
    { label: 'Comprar', href: `${basePath}` },
    { label: 'Arrendar', href: `${basePath}` },
    { label: 'Avaliação', href: `${basePath}#simuladores` },
    { label: 'Publicar', href: '/publicar' },
    { label: 'Painéis', href: '/painel' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream-100/80 backdrop-blur-md border-b border-border">
      <nav className="luxury-container flex items-center justify-between h-18">
        {/* Logo */}
        <Link href={basePath} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-olive-500 flex items-center justify-center">
            <span className="text-white font-serif text-lg font-bold tracking-tight">P</span>
          </div>
          <div className="hidden sm:block">
            <span className="font-serif text-heading-3 text-olive-500 tracking-tight">Portal</span>
            <span className="font-serif text-heading-3 text-accent ml-1 tracking-tight">Premium</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-body text-foreground-muted hover:text-foreground transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Market switcher */}
          <button
            onClick={switchMarket}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-caption font-medium text-foreground-muted hover:bg-cream-200 transition-colors border border-border"
            title={`Mudar para ${MARKET_CONFIG[otherMarket].name}`}
          >
            <span className="text-base">{config.flag}</span>
            <span>{config.currency}</span>
            <ArrowLeftRight className="w-3 h-3 text-foreground-muted" />
            <span className="text-base">{MARKET_CONFIG[otherMarket].flag}</span>
          </button>

          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/favoritos" className="p-2.5 rounded-lg text-foreground-muted hover:bg-cream-200 transition-colors" title="Favoritos">
                <Heart className="w-4 h-4" />
              </Link>
              <Link href="/alertas" className="p-2.5 rounded-lg text-foreground-muted hover:bg-cream-200 transition-colors" title="Alertas">
                <Bell className="w-4 h-4" />
              </Link>
              <Link href="/painel" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-olive-500 text-white text-caption font-medium hover:bg-olive-600 transition-colors">
                <User className="w-4 h-4" />
                <span className="truncate max-w-[100px]">{user.name}</span>
              </Link>
              <button
                onClick={logout}
                className="p-2.5 rounded-lg text-foreground-muted hover:bg-cream-200 transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/auth/login" className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-olive-500 text-white text-caption font-medium hover:bg-olive-600 transition-colors">
                <User className="w-4 h-4" />
                <span>Entrar</span>
              </Link>
            </div>
          )}

          <button
            className="md:hidden p-2 rounded-lg text-foreground-muted hover:bg-cream-200 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-cream-100 border-b border-border px-6 pb-6 pt-2 space-y-4">
          <div className="flex items-center gap-3 py-3 border-b border-border">
            <span className="text-2xl">{config.flag}</span>
            <span className="text-body font-medium">{config.name}</span>
            <button
              onClick={switchMarket}
              className="ml-auto flex items-center gap-1 text-caption text-accent"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Mudar para {MARKET_CONFIG[otherMarket].name}
            </button>
          </div>
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block text-body text-foreground py-2 border-b border-border"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <div className="pt-2 flex gap-3">
              <Link href="/painel" className="flex-1 btn-primary">{user.name}</Link>
              <button onClick={logout} className="flex-1 btn-ghost">Sair</button>
            </div>
          ) : (
            <div className="pt-2 flex gap-3">
              <Link href="/auth/login" className="flex-1 btn-primary">Entrar</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
