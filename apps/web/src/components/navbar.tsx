'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Menu, X, Globe, User, LogOut } from 'lucide-react';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream-100/80 backdrop-blur-md border-b border-border">
      <nav className="luxury-container flex items-center justify-between h-18">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
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
          <Link href="/explorar" className="text-body text-foreground-muted hover:text-foreground transition-colors duration-300">Explorar</Link>
          <Link href="/" className="text-body text-foreground-muted hover:text-foreground transition-colors duration-300">Comprar</Link>
          <Link href="/" className="text-body text-foreground-muted hover:text-foreground transition-colors duration-300">Arrendar</Link>
          <Link href="/publicar" className="text-body text-accent hover:text-accent/80 transition-colors duration-300 font-medium">Publicar anúncio</Link>
          <Link href="/#simuladores" className="text-body text-foreground-muted hover:text-foreground transition-colors duration-300">Avaliação</Link>
          <Link href="/painel" className="text-body text-foreground-muted hover:text-foreground transition-colors duration-300">Painéis</Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-caption text-foreground-muted hover:bg-cream-200 transition-colors">
            <Globe className="w-4 h-4" />
            <span>PT</span>
          </button>
          
          {user ? (
            <div className="hidden md:flex items-center gap-2">
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
            <Link href="/auth/login" className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-lg bg-olive-500 text-white text-caption font-medium hover:bg-olive-600 transition-colors">
              <User className="w-4 h-4" />
              <span>Entrar</span>
            </Link>
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
          <Link href="/explorar" className="block text-body text-foreground py-2 border-b border-border">Explorar</Link>
          <Link href="/" className="block text-body text-foreground py-2 border-b border-border">Comprar</Link>
          <Link href="/" className="block text-body text-foreground py-2 border-b border-border">Arrendar</Link>
          <Link href="/publicar" className="block text-body text-accent py-2 border-b border-border font-medium">Publicar anúncio</Link>
          <Link href="/#simuladores" className="block text-body text-foreground py-2 border-b border-border">Avaliação</Link>
          <Link href="/painel" className="block text-body text-foreground py-2 border-b border-border">Painéis</Link>
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
