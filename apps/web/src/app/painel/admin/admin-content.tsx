'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { api } from '@/lib/api';
import { ShieldCheck, FileWarning, Users, Activity, Building2, TrendingUp, Mail, Calculator } from 'lucide-react';

export default function AdminContent() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getAnalyticsOverview()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setIsLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Total Imóveis', value: String(stats.totalProperties), change: `${stats.activeProperties} ativos`, changeType: 'positive' as const, icon: Building2, color: 'bg-olive-500' },
    { label: 'Total Leads', value: String(stats.totalLeads), change: `+${stats.recentLeads} este mês`, changeType: 'positive' as const, icon: Users, color: 'bg-blue-500' },
    { label: 'Simulações', value: String(stats.totalSimulations), change: `+${stats.recentSimulations} este mês`, changeType: 'positive' as const, icon: Calculator, color: 'bg-accent' },
    { label: 'Taxa Conversão', value: `${stats.conversionRate}%`, change: 'leads/simulações', changeType: 'neutral' as const, icon: TrendingUp, color: 'bg-purple-500' },
  ] : [];

  return (
    <div className="min-h-screen bg-cream-100">
      <Sidebar role="admin" userName="Admin" userRole="Chief Compliance Officer" />
      <div className="lg:ml-64">
        <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="font-serif text-heading-1 text-foreground">Dashboard de Administração</h1>
            <p className="text-body text-foreground-muted mt-1">Moderação, compliance e auditoria em tempo real</p>
          </div>

          {/* Stats Reais */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 border-3 border-olive-200 border-t-olive-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((stat) => (
                <div key={stat.label} className="bg-surface-elevated rounded-2xl border border-border shadow-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-caption text-foreground-muted">{stat.label}</span>
                    <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="font-serif text-heading-1 text-foreground">{stat.value}</p>
                  <p className={`text-caption mt-1 ${
                    stat.changeType === 'positive' ? 'text-emerald-600' :
                    'text-foreground-muted'
                  }`}>{stat.change}</p>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <a href="/painel/admin/users" className="group bg-surface-elevated rounded-2xl border border-border shadow-card p-6 hover:border-olive-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-serif text-heading-3 text-foreground">Gestão de Utilizadores</h3>
                  <p className="text-caption text-foreground-muted">RBAC, convites e permissões</p>
                </div>
              </div>
            </a>
            <a href="/painel/admin/kyc" className="group bg-surface-elevated rounded-2xl border border-border shadow-card p-6 hover:border-olive-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-serif text-heading-3 text-foreground">Central KYC</h3>
                  <p className="text-caption text-foreground-muted">Aprovação de identidades</p>
                </div>
              </div>
            </a>
            <a href="/painel/admin/auditoria" className="group bg-surface-elevated rounded-2xl border border-border shadow-card p-6 hover:border-olive-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <Activity className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-serif text-heading-3 text-foreground">Auditoria & Logs</h3>
                  <p className="text-caption text-foreground-muted">Registo forense de operações</p>
                </div>
              </div>
            </a>
          </div>

          {/* Recent Activity Preview */}
          <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-heading-3 text-foreground">Atividade Recente</h3>
              <a href="/painel/admin/auditoria" className="text-caption text-accent hover:underline">Ver todos</a>
            </div>
            <p className="text-body text-foreground-muted">
              O registo de auditoria captura automaticamente todas as operações de escrita na plataforma.
              Aceda à página de auditoria para consultar o histórico completo com filtros e paginação.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
