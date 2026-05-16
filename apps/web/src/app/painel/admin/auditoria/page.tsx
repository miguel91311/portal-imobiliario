'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { api } from '@/lib/api';
import { Activity, Search, Shield, FileEdit, UserCheck, UserX, Building2, Upload, Trash2 } from 'lucide-react';

const actionIcons: Record<string, React.ElementType> = {
  ALTERAÇÃO_DE_ROLE: Shield,
  ALTERAÇÃO_KYC: UserCheck,
  ATIVAÇÃO_CONTA: UserCheck,
  DESATIVAÇÃO_CONTA: UserX,
  EDIÇÃO_UTILIZADOR: FileEdit,
  CRIAÇÃO_IMÓVEL: Building2,
  EDIÇÃO_IMÓVEL: FileEdit,
  ATUALIZAÇÃO_LEAD: FileEdit,
  UPLOAD_DOCUMENTO: Upload,
  ELIMINAÇÃO_DOCUMENTO: Trash2,
};

const actionColors: Record<string, string> = {
  ALTERAÇÃO_DE_ROLE: 'text-purple-600 bg-purple-50',
  ALTERAÇÃO_KYC: 'text-emerald-600 bg-emerald-50',
  ATIVAÇÃO_CONTA: 'text-emerald-600 bg-emerald-50',
  DESATIVAÇÃO_CONTA: 'text-red-600 bg-red-50',
  EDIÇÃO_UTILIZADOR: 'text-blue-600 bg-blue-50',
  CRIAÇÃO_IMÓVEL: 'text-olive-600 bg-olive-50',
  EDIÇÃO_IMÓVEL: 'text-amber-600 bg-amber-50',
  ATUALIZAÇÃO_LEAD: 'text-blue-600 bg-blue-50',
  UPLOAD_DOCUMENTO: 'text-cyan-600 bg-cyan-50',
  ELIMINAÇÃO_DOCUMENTO: 'text-red-600 bg-red-50',
};

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const limit = 25;

  useEffect(() => {
    loadLogs();
  }, [page, actionFilter]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(limit) };
      if (actionFilter) params.action = actionFilter;
      const data = await api.getActivityLogs(params);
      setLogs(data.value);
      setTotal(data['@odata.count']);
    } catch {
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-cream-100">
        <Sidebar role="admin" userName="Admin" userRole="Chief Compliance Officer" />
        <div className="lg:ml-64">
          <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-serif text-heading-1 text-foreground">Auditoria & Logs</h1>
                <p className="text-body text-foreground-muted mt-1">Registo forense de todas as operações críticas</p>
              </div>
              <div className="text-right">
                <p className="font-serif text-heading-2 text-olive-500">{total}</p>
                <p className="text-caption text-foreground-muted">registos totais</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <select
                value={actionFilter}
                onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                className="px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20"
              >
                <option value="">Todas as ações</option>
                <option value="ALTERAÇÃO_DE_ROLE">Alteração de Role</option>
                <option value="ALTERAÇÃO_KYC">Alteração KYC</option>
                <option value="CRIAÇÃO_IMÓVEL">Criação de Imóvel</option>
                <option value="EDIÇÃO_IMÓVEL">Edição de Imóvel</option>
                <option value="ATUALIZAÇÃO_LEAD">Atualização de Lead</option>
                <option value="UPLOAD_DOCUMENTO">Upload Documento</option>
                <option value="ELIMINAÇÃO_DOCUMENTO">Eliminação Documento</option>
              </select>
            </div>

            {/* Logs */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-3 border-olive-200 border-t-olive-500 rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <div className="bg-surface-elevated rounded-2xl border border-border shadow-card overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-cream-50">
                        <th className="text-left text-overline text-foreground-muted uppercase tracking-wider px-6 py-4">Ação</th>
                        <th className="text-left text-overline text-foreground-muted uppercase tracking-wider px-6 py-4">Utilizador</th>
                        <th className="text-left text-overline text-foreground-muted uppercase tracking-wider px-6 py-4">Alvo</th>
                        <th className="text-left text-overline text-foreground-muted uppercase tracking-wider px-6 py-4">Detalhes</th>
                        <th className="text-left text-overline text-foreground-muted uppercase tracking-wider px-6 py-4">IP</th>
                        <th className="text-right text-overline text-foreground-muted uppercase tracking-wider px-6 py-4">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => {
                        const Icon = actionIcons[log.action] || Activity;
                        const colorClass = actionColors[log.action] || 'text-gray-600 bg-gray-50';
                        return (
                          <tr key={log.id} className="border-b border-border last:border-0 hover:bg-cream-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <span className="text-body text-foreground font-medium">{log.action}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {log.user ? (
                                <div>
                                  <p className="text-body text-foreground">{log.user.name}</p>
                                  <p className="text-caption text-foreground-muted">{log.user.email}</p>
                                </div>
                              ) : (
                                <span className="text-caption text-foreground-muted">Sistema</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-body text-foreground">{log.target || '—'}</td>
                            <td className="px-6 py-4 text-caption text-foreground-muted max-w-xs truncate">{log.details || '—'}</td>
                            <td className="px-6 py-4 text-caption text-foreground-muted font-mono">{log.ipAddress || '—'}</td>
                            <td className="px-6 py-4 text-right text-caption text-foreground-muted">
                              {new Date(log.createdAt).toLocaleString('pt-PT')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {logs.length === 0 && (
                    <div className="text-center py-12 text-foreground-muted">
                      <Activity className="w-10 h-10 mx-auto mb-3 text-foreground-muted/50" />
                      <p className="text-body">Nenhum registo encontrado</p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-xl border border-border bg-white text-body disabled:opacity-40"
                    >
                      Anterior
                    </button>
                    <span className="text-caption text-foreground-muted">
                      Página {page} de {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 rounded-xl border border-border bg-white text-body disabled:opacity-40"
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
