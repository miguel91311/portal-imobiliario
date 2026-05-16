'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { api } from '@/lib/api';
import { FileCheck, UserCheck, UserX, Shield, Search, Filter } from 'lucide-react';

export default function KYCPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  useEffect(() => {
    loadUsers();
  }, [statusFilter, riskFilter]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.kycStatus = statusFilter;
      const data = await api.getUsers(params);
      let filtered = data.value;
      if (riskFilter) {
        filtered = filtered.filter((u: any) => u.kycRisk === riskFilter);
      }
      setUsers(filtered);
    } catch {
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateKYC = async (id: string, kycStatus: string, kycRisk?: string) => {
    try {
      await api.updateUserKYC(id, kycStatus, kycRisk);
      loadUsers();
    } catch (err) {
      alert('Erro ao atualizar KYC');
    }
  };

  const stats = {
    pending: users.filter(u => u.kycStatus === 'pending').length,
    approved: users.filter(u => u.kycStatus === 'approved').length,
    rejected: users.filter(u => u.kycStatus === 'rejected').length,
    highRisk: users.filter(u => u.kycRisk === 'high').length,
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-cream-100">
        <Sidebar role="admin" userName="Admin" userRole="Chief Compliance Officer" />
        <div className="lg:ml-64">
          <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="font-serif text-heading-1 text-foreground">Central KYC / RGPD</h1>
              <p className="text-body text-foreground-muted mt-1">Aprovação de identidades e verificação de compliance</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Pendentes', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50', icon: FileCheck },
                { label: 'Aprovados', value: stats.approved, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: UserCheck },
                { label: 'Rejeitados', value: stats.rejected, color: 'text-red-600', bg: 'bg-red-50', icon: UserX },
                { label: 'Risco Alto', value: stats.highRisk, color: 'text-red-600', bg: 'bg-red-50', icon: Shield },
              ].map((s) => (
                <div key={s.label} className="bg-surface-elevated rounded-2xl border border-border shadow-card p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                      <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
                    </div>
                    <span className="text-caption text-foreground-muted">{s.label}</span>
                  </div>
                  <p className={`font-serif text-heading-1 ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20"
              >
                <option value="">Todos os status</option>
                <option value="pending">Pendente</option>
                <option value="approved">Aprovado</option>
                <option value="rejected">Rejeitado</option>
              </select>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20"
              >
                <option value="">Todos os riscos</option>
                <option value="low">Baixo</option>
                <option value="medium">Médio</option>
                <option value="high">Alto</option>
              </select>
              <button onClick={loadUsers} className="btn-ghost">Atualizar</button>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-3 border-olive-200 border-t-olive-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="bg-surface-elevated rounded-2xl border border-border shadow-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-cream-50">
                      <th className="text-left text-overline text-foreground-muted uppercase tracking-wider px-6 py-4">Utilizador</th>
                      <th className="text-left text-overline text-foreground-muted uppercase tracking-wider px-6 py-4">Role</th>
                      <th className="text-left text-overline text-foreground-muted uppercase tracking-wider px-6 py-4">Status KYC</th>
                      <th className="text-left text-overline text-foreground-muted uppercase tracking-wider px-6 py-4">Risco</th>
                      <th className="text-right text-overline text-foreground-muted uppercase tracking-wider px-6 py-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border last:border-0 hover:bg-cream-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-olive-500/10 flex items-center justify-center text-olive-500 font-medium text-sm">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-body text-foreground font-medium">{user.name}</p>
                              <p className="text-caption text-foreground-muted">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-caption font-medium bg-gray-100 text-gray-700">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-medium ${
                            user.kycStatus === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                            user.kycStatus === 'rejected' ? 'bg-red-50 text-red-700' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {user.kycStatus === 'approved' ? <UserCheck className="w-3 h-3" /> :
                             user.kycStatus === 'rejected' ? <UserX className="w-3 h-3" /> :
                             <FileCheck className="w-3 h-3" />}
                            {user.kycStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-caption font-medium ${
                            user.kycRisk === 'high' ? 'bg-red-50 text-red-700' :
                            user.kycRisk === 'medium' ? 'bg-amber-50 text-amber-700' :
                            'bg-emerald-50 text-emerald-700'
                          }`}>
                            {user.kycRisk}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => updateKYC(user.id, 'approved', user.kycRisk)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-caption hover:bg-emerald-100 transition-colors"
                            >
                              Aprovar
                            </button>
                            <button
                              onClick={() => updateKYC(user.id, 'rejected', user.kycRisk)}
                              className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-caption hover:bg-red-100 transition-colors"
                            >
                              Rejeitar
                            </button>
                            <select
                              value={user.kycRisk}
                              onChange={(e) => updateKYC(user.id, user.kycStatus, e.target.value)}
                              className="text-caption px-2 py-1 rounded-lg border border-border bg-white"
                            >
                              <option value="low">Baixo</option>
                              <option value="medium">Médio</option>
                              <option value="high">Alto</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="text-center py-12 text-foreground-muted">
                    <Shield className="w-10 h-10 mx-auto mb-3 text-foreground-muted/50" />
                    <p className="text-body">Nenhum utilizador encontrado</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
