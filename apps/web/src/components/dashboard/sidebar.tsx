'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileCheck,
  ShieldAlert,
  BarChart3,
  Building2,
  Trophy,
  Handshake,
  FolderOpen,
  TrendingUp,
  Bell,
  Settings,
  LogOut,
  Home,
  Plug,
  Webhook,
  Workflow,
} from 'lucide-react';

type Role = 'admin' | 'agente' | 'proprietario';

interface SidebarProps {
  role: Role;
  userName: string;
  userRole: string;
}

const menus: Record<Role, Array<{ label: string; href: string; icon: React.ElementType }>> = {
  admin: [
    { label: 'Dashboard', href: '/painel/admin', icon: LayoutDashboard },
    { label: 'KYC & Moderação', href: '/painel/admin/kyc', icon: FileCheck },
    { label: 'Gestão de Utilizadores', href: '/painel/admin/users', icon: Users },
    { label: 'Auditoria & Logs', href: '/painel/admin/auditoria', icon: BarChart3 },
    { label: 'Integrações', href: '/painel/admin/integracoes', icon: Plug },
    { label: 'Webhooks', href: '/painel/admin/webhooks', icon: Webhook },
    { label: 'Workflows', href: '/painel/admin/workflows', icon: Workflow },
    { label: 'DaaS / Relatórios', href: '/painel/admin/daas', icon: TrendingUp },
  ],
  agente: [
    { label: 'Dashboard', href: '/painel/agente', icon: LayoutDashboard },
    { label: 'Os Meus Leads', href: '/painel/agente/leads', icon: Users },
    { label: 'As Minhas Propriedades', href: '/painel/agente/imoveis', icon: Building2 },
    { label: 'A Minha Equipa', href: '/painel/agente/equipa', icon: Handshake },
    { label: 'Performance & KPIs', href: '/painel/agente/performance', icon: Trophy },
    { label: 'Inteligência de Mercado', href: '/painel/agente/mercado', icon: TrendingUp },
    { label: 'Integrações Externas', href: '/painel/agente/integracoes', icon: Plug },
    { label: 'Destaques Premium', href: '/painel/agente/destaques', icon: TrendingUp },
    { label: 'Planos & Preços', href: '/painel/agente/planos', icon: Trophy },
  ],
  proprietario: [
    { label: 'Dashboard', href: '/painel/proprietario', icon: LayoutDashboard },
    { label: 'Os Meus Anúncios', href: '/painel/proprietario/imoveis', icon: Building2 },
    { label: 'Novo Anúncio', href: '/painel/proprietario/imoveis/novo', icon: FolderOpen },
    { label: 'Destaques & Upgrades', href: '/painel/proprietario/destaques', icon: Trophy },
    { label: 'Desempenho', href: '/painel/proprietario/desempenho', icon: TrendingUp },
    { label: 'Alertas de Avaliação', href: '/painel/proprietario/alertas', icon: Bell },
  ],
};

export function Sidebar({ role, userName, userRole }: SidebarProps) {
  const pathname = usePathname();
  const items = menus[role];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-olive-500 text-white flex flex-col z-40">
      {/* Logo */}
      <div className="h-18 flex items-center gap-3 px-6 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
          <span className="font-serif text-lg font-bold">P</span>
        </div>
        <div>
          <span className="font-serif text-base font-medium">Portal</span>
          <span className="font-serif text-base text-accent-gold ml-1">Premium</span>
        </div>
      </div>

      {/* User */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-medium">{userName.charAt(0)}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-white/50 truncate">{userRole}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                isActive
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="w-4.5 h-4.5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all">
          <Home className="w-4.5 h-4.5 shrink-0" />
          <span>Voltar ao Site</span>
        </Link>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all">
          <Settings className="w-4.5 h-4.5 shrink-0" />
          <span>Definições</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:bg-red-500/20 hover:text-red-200 transition-all">
          <LogOut className="w-4.5 h-4.5 shrink-0" />
          <span>Terminar Sessão</span>
        </button>
      </div>
    </aside>
  );
}
