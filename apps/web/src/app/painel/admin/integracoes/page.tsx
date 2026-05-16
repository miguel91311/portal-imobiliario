'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { api } from '@/lib/api';
import {
  Plug, Download, Cloud, CloudOff, CheckCircle2, AlertTriangle,
  ExternalLink, FileText, Globe, RefreshCw
} from 'lucide-react';

const integrations = [
  {
    id: 'idealista',
    name: 'Idealista',
    status: 'connected',
    type: 'portal',
    lastSync: '2026-05-10 14:30',
    listingsSynced: 12,
    circuitBreaker: 'closed',
  },
  {
    id: 'imovirtual',
    name: 'Imovirtual',
    status: 'connected',
    type: 'portal',
    lastSync: '2026-05-10 13:45',
    listingsSynced: 8,
    circuitBreaker: 'closed',
  },
  {
    id: 'olx',
    name: 'OLX Portugal',
    status: 'disconnected',
    type: 'portal',
    lastSync: null,
    listingsSynced: 0,
    circuitBreaker: 'open',
  },
  {
    id: 'sapo',
    name: 'SAPO Imóveis',
    status: 'degraded',
    type: 'portal',
    lastSync: '2026-05-09 18:00',
    listingsSynced: 5,
    circuitBreaker: 'half-open',
  },
];

export default function IntegracoesPage() {
  const [isExporting, setIsExporting] = useState(false);

  const exportOpenImmo = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('http://localhost:3001/api/openimmo/export', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('portal_token') || ''}`,
        },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'portal-premium-openimmo.xml';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Erro ao exportar');
    } finally {
      setIsExporting(false);
    }
  };

  const getCircuitBreakerColor = (state: string) => {
    switch (state) {
      case 'closed': return 'bg-emerald-500';
      case 'half-open': return 'bg-amber-500';
      case 'open': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'connected': return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Ligado' };
      case 'disconnected': return { icon: CloudOff, color: 'text-red-600', bg: 'bg-red-50', label: 'Desligado' };
      case 'degraded': return { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Degradado' };
      default: return { icon: Cloud, color: 'text-gray-600', bg: 'bg-gray-50', label: status };
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-cream-100">
        <Sidebar role="admin" userName="Admin" userRole="Chief Compliance Officer" />
        <div className="lg:ml-64">
          <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="font-serif text-heading-1 text-foreground">Hub de Integrações</h1>
              <p className="text-body text-foreground-muted mt-1">Circuit Breaker, sincronização e exportação</p>
            </div>

            {/* OpenImmo Export */}
            <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-serif text-heading-3 text-foreground">Exportação OpenImmo</h3>
                    <p className="text-caption text-foreground-muted">Gerar ficheiro XML para outras agências europeias</p>
                  </div>
                </div>
                <button
                  onClick={exportOpenImmo}
                  disabled={isExporting}
                  className="btn-primary gap-2"
                >
                  {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {isExporting ? 'A gerar...' : 'Exportar XML'}
                </button>
              </div>
            </div>

            {/* Circuit Breaker Panel */}
            <div className="mb-8">
              <h2 className="font-serif text-heading-2 text-foreground mb-4 flex items-center gap-2">
                <Plug className="w-5 h-5 text-accent" />
                Painel do Circuit Breaker
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map((integration) => {
                  const config = getStatusConfig(integration.status);
                  const StatusIcon = config.icon;
                  return (
                    <div key={integration.id} className="bg-surface-elevated rounded-2xl border border-border shadow-card p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center`}>
                            <Globe className={`w-5 h-5 ${config.color}`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{integration.name}</h4>
                            <span className={`inline-flex items-center gap-1 text-caption ${config.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {config.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${getCircuitBreakerColor(integration.circuitBreaker)}`} />
                          <span className="text-caption text-foreground-muted uppercase">
                            {integration.circuitBreaker === 'closed' ? 'SAUDÁVEL' :
                             integration.circuitBreaker === 'half-open' ? 'RECUPERAÇÃO' :
                             'FALHA'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-caption text-foreground-muted">Última Sincronização</p>
                          <p className="text-body text-foreground">{integration.lastSync || 'Nunca'}</p>
                        </div>
                        <div>
                          <p className="text-caption text-foreground-muted">Anúncios Sincronizados</p>
                          <p className="text-body text-foreground">{integration.listingsSynced}</p>
                        </div>
                      </div>

                      {integration.circuitBreaker === 'open' && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                          <p className="text-caption text-red-700">
                            <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                            Circuit breaker aberto — servidor externo indisponível. Tentativas de ligação suspensas temporariamente para proteger a plataforma.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Integration Guide */}
            <div className="bg-olive-50/50 border border-olive-200 rounded-2xl p-6">
              <h3 className="font-serif text-heading-3 text-olive-700 mb-2 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Como funciona o Circuit Breaker?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="p-4 bg-white rounded-xl border border-olive-100">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-body text-olive-700 font-medium">Fechado (Saudável)</p>
                  <p className="text-caption text-olive-600">Pedidos fluem normalmente. Tudo está bem.</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-olive-100">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center mb-2">
                    <AlertTriangle className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-body text-olive-700 font-medium">Meio-Aberto (Recuperação)</p>
                  <p className="text-caption text-olive-600">Testando se o servidor voltou. Poucos pedidos de teste.</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-olive-100">
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center mb-2">
                    <CloudOff className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-body text-olive-700 font-medium">Aberto (Falha)</p>
                  <p className="text-caption text-olive-600">Servidor externo caído. Pedidos bloqueados para proteger o site.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
