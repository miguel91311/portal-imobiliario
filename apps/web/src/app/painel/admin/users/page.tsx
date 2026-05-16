'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { api } from '@/lib/api';
import { Users, UserCheck, UserX, Shield, Mail, Building2, Search, Plus, ChevronDown } from 'lucide-react';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', name: '', role: 'agent', country: 'PT', agency: '', licenseId: '' });
  const [inviteResult, setInviteResult] = useState<any>(null);

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const data = await api.getUsers(params);
      setUsers(data.value);
    } catch {
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => loadUsers();

  const updateRole = async (id: string, role: string) => {
    try {
      await api.updateUserRole(id, role);
      loadUsers();
    } catch (err) {
      alert('Erro ao alterar role');
    }
  };

  const toggleStatus = async (id: string, isActive: boolean) => {
    try {
      await api.updateUserStatus(id, !isActive);
      loadUsers();
    } catch (err) {
      alert('Erro ao alterar status');
    }
  };

  const inviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await api.inviteUser(inviteForm);
      setInviteResult(result);
      setInviteForm({ email: '', name: '', role: 'agent', country: 'PT', agency: '', licenseId: '' });
      loadUsers();
    } catch (err: any) {
      alert(err?.data?.error || 'Erro ao convidar');
    }
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    agent: 'bg-blue-100 text-blue-700',
    owner: 'bg-purple-100 text-purple-700',
    buyer: 'bg-gray-100 text-gray-700',
  };

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    agent: 'Agente',
    owner: 'Proprietário',
    buyer: 'Comprador',
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-cream-100">
        <Sidebar role="admin" userName="Admin" userRole="Chief Compliance Officer" />
        <div className="lg:ml-64">
          <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-serif text-heading-1 text-foreground">Gestão de Utilizadores</h1>
                <p className="text-body text-foreground-muted mt-1">RBAC — Roles, permissões e convites</p>
              </div>
              <button
                onClick={() => setShowInviteModal(true)}
                className="btn-primary gap-2"
              >
                <Plus className="w-4 h-4" />
                Convidar Utilizador
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20"
              >
                <option value="">Todos os roles</option>
                <option value="admin">Administrador</option>
                <option value="agent">Agente</option>
                <option value="owner">Proprietário</option>
                <option value="buyer">Comprador</option>
              </select>
              <button onClick={handleSearch} className="btn-ghost">Filtrar</button>
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
                      <th className="text-left text-overline text-foreground-muted uppercase tracking-wider px-6 py-4">País</th>
                      <th className="text-left text-overline text-foreground-muted uppercase tracking-wider px-6 py-4">Agência</th>
                      <th className="text-left text-overline text-foreground-muted uppercase tracking-wider px-6 py-4">KYC</th>
                      <th className="text-left text-overline text-foreground-muted uppercase tracking-wider px-6 py-4">Estado</th>
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
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-medium ${roleColors[user.role] || roleColors.buyer}`}>
                            <Shield className="w-3 h-3" />
                            {roleLabels[user.role] || user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-body text-foreground">{user.country}</td>
                        <td className="px-6 py-4 text-body text-foreground">{user.agency || '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-caption ${
                            user.kycStatus === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                            user.kycStatus === 'rejected' ? 'bg-red-50 text-red-700' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {user.kycStatus === 'approved' ? <UserCheck className="w-3 h-3" /> :
                             user.kycStatus === 'rejected' ? <UserX className="w-3 h-3" /> :
                             <Shield className="w-3 h-3" />}
                            {user.kycStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-caption ${user.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {user.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={user.role}
                              onChange={(e) => updateRole(user.id, e.target.value)}
                              className="text-caption px-2 py-1 rounded-lg border border-border bg-white"
                            >
                              <option value="admin">Admin</option>
                              <option value="agent">Agente</option>
                              <option value="owner">Proprietário</option>
                              <option value="buyer">Comprador</option>
                            </select>
                            <button
                              onClick={() => toggleStatus(user.id, user.isActive)}
                              className={`p-1.5 rounded-lg transition-colors ${user.isActive ? 'hover:bg-red-50 text-red-600' : 'hover:bg-emerald-50 text-emerald-600'}`}
                              title={user.isActive ? 'Desativar' : 'Ativar'}
                            >
                              {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="text-center py-12 text-foreground-muted">
                    <Users className="w-10 h-10 mx-auto mb-3 text-foreground-muted/50" />
                    <p className="text-body">Nenhum utilizador encontrado</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface-elevated rounded-2xl border border-border shadow-2xl w-full max-w-lg mx-4 p-6">
            <h2 className="font-serif text-heading-2 text-foreground mb-4">Convidar Utilizador</h2>
            {inviteResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-body text-emerald-700 font-medium">✅ Utilizador convidado com sucesso!</p>
                  <p className="text-caption text-emerald-600 mt-1">Palavra-passe temporária: <strong>{inviteResult.tempPassword}</strong></p>
                </div>
                <button onClick={() => { setInviteResult(null); setShowInviteModal(false); }} className="w-full btn-primary">Fechar</button>
              </div>
            ) : (
              <form onSubmit={inviteUser} className="space-y-4">
                <div>
                  <label className="text-caption text-foreground-muted block mb-1">Nome</label>
                  <input required value={inviteForm.name} onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body" />
                </div>
                <div>
                  <label className="text-caption text-foreground-muted block mb-1">Email</label>
                  <input type="email" required value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-caption text-foreground-muted block mb-1">Role</label>
                    <select value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body">
                      <option value="agent">Agente</option>
                      <option value="admin">Administrador</option>
                      <option value="owner">Proprietário</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-caption text-foreground-muted block mb-1">País</label>
                    <select value={inviteForm.country} onChange={(e) => setInviteForm({ ...inviteForm, country: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body">
                      <option value="PT">Portugal</option>
                      <option value="AO">Angola</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-caption text-foreground-muted block mb-1">Agência (opcional)</label>
                  <input value={inviteForm.agency} onChange={(e) => setInviteForm({ ...inviteForm, agency: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body" />
                </div>
                <div>
                  <label className="text-caption text-foreground-muted block mb-1">Licença (opcional)</label>
                  <input value={inviteForm.licenseId} onChange={(e) => setInviteForm({ ...inviteForm, licenseId: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowInviteModal(false)} className="flex-1 btn-ghost">Cancelar</button>
                  <button type="submit" className="flex-1 btn-primary gap-2"><Mail className="w-4 h-4" /> Convidar</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
