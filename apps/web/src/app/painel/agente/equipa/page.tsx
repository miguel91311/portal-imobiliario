'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import {
  Users, Plus, Trash2, Crown, UserCheck, X, Mail, Percent,
  Building2, Link2
} from 'lucide-react';

export default function TeamPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', slug: '', description: '', country: 'PT' });
  const [inviteData, setInviteData] = useState({ email: '', name: '', role: 'agent', commissionRate: 50 });

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTeams();
      setTeams(data.value);
      if (data.value.length > 0) {
        const membersData = await api.getTeamMembers(data.value[0].id);
        setMembers(membersData.value);
      }
    } catch {
      setTeams([]);
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTeam(newTeam);
      setShowCreate(false);
      setNewTeam({ name: '', slug: '', description: '', country: 'PT' });
      loadTeams();
    } catch (err: any) {
      alert(err?.data?.error || 'Erro ao criar equipa');
    }
  };

  const inviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (teams.length === 0) return;
    try {
      await api.inviteTeamMember(teams[0].id, inviteData);
      setShowInvite(false);
      setInviteData({ email: '', name: '', role: 'agent', commissionRate: 50 });
      loadTeams();
    } catch (err: any) {
      alert(err?.data?.error || 'Erro ao convidar membro');
    }
  };

  const removeMember = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este membro?')) return;
    if (teams.length === 0) return;
    try {
      await api.removeTeamMember(teams[0].id, userId);
      loadTeams();
    } catch (err: any) {
      alert(err?.data?.error || 'Erro ao remover membro');
    }
  };

  const isBroker = teams.length > 0 && teams[0].myRole === 'broker';
  const team = teams.length > 0 ? teams[0] : null;

  return (
    <ProtectedRoute allowedRoles={['admin', 'agent']}>
      <div className="min-h-screen bg-cream-100">
        <Sidebar role="agente" userName={user?.name || 'Agente'} userRole="Agente Imobiliário" />
        <div className="lg:ml-64">
          <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-serif text-heading-1 text-foreground">A Minha Equipa</h1>
                <p className="text-body text-foreground-muted mt-1">Gestão de equipa e colaboradores</p>
              </div>
              {team && isBroker && (
                <button
                  onClick={() => setShowInvite(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-olive-500 text-white rounded-xl text-sm font-medium hover:bg-olive-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Convidar Membro
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-3 border-olive-200 border-t-olive-500 rounded-full animate-spin" />
              </div>
            ) : !team ? (
              <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-10 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-foreground-muted/50" />
                <h3 className="font-serif text-heading-2 text-foreground mb-2">Ainda não tem equipa</h3>
                <p className="text-body text-foreground-muted mb-6 max-w-md mx-auto">
                  Crie uma equipa para partilhar leads e propriedades com outros agentes. Colaborar aumenta a produtividade em média 3x.
                </p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-olive-500 text-white rounded-xl font-medium hover:bg-olive-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Criar Equipa
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Team Card */}
                <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="font-serif text-heading-2 text-foreground">{team.name}</h2>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          team.myRole === 'broker' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {team.myRole === 'broker' ? 'Broker' : 'Membro'}
                        </span>
                      </div>
                      <p className="text-body text-foreground-muted">{team.description || 'Sem descrição'}</p>
                      <div className="flex items-center gap-4 mt-3 text-caption text-foreground-muted">
                        <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {team.country}</span>
                        <span className="flex items-center gap-1"><Link2 className="w-3.5 h-3.5" /> /equipa/{team.slug}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="font-serif text-heading-1 text-foreground">{team._count.members}</p>
                          <p className="text-caption text-foreground-muted">Membros</p>
                        </div>
                        <div className="text-center">
                          <p className="font-serif text-heading-1 text-foreground">{team._count.properties}</p>
                          <p className="text-caption text-foreground-muted">Imóveis</p>
                        </div>
                        <div className="text-center">
                          <p className="font-serif text-heading-1 text-foreground">{team._count.leads}</p>
                          <p className="text-caption text-foreground-muted">Leads</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Members Table */}
                <div className="bg-surface-elevated rounded-2xl border border-border shadow-card overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-cream-50">
                        <th className="text-left text-overline text-foreground-muted uppercase tracking-wider px-6 py-4">Membro</th>
                        <th className="text-left text-overline text-foreground-muted uppercase tracking-wider px-6 py-4">Função</th>
                        <th className="text-left text-overline text-foreground-muted uppercase tracking-wider px-6 py-4">Comissão</th>
                        <th className="text-left text-overline text-foreground-muted uppercase tracking-wider px-6 py-4">Entrou em</th>
                        {isBroker && <th className="text-right text-overline text-foreground-muted uppercase tracking-wider px-6 py-4">Ações</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((m) => (
                        <tr key={m.id} className="border-b border-border last:border-0 hover:bg-cream-50/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-olive-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-olive-700">{m.user.name.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="text-body text-foreground font-medium">{m.user.name}</p>
                                <p className="text-caption text-foreground-muted">{m.user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-caption font-medium ${
                              m.role === 'broker' ? 'bg-amber-50 text-amber-700' :
                              m.role === 'assistant' ? 'bg-purple-50 text-purple-700' :
                              'bg-blue-50 text-blue-700'
                            }`}>
                              {m.role === 'broker' ? <Crown className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                              {m.role === 'broker' ? 'Broker' : m.role === 'assistant' ? 'Assistente' : 'Agente'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-body text-foreground">{m.commissionRate}%</span>
                          </td>
                          <td className="px-6 py-4 text-caption text-foreground-muted">
                            {new Date(m.joinedAt).toLocaleDateString('pt-PT')}
                          </td>
                          {isBroker && (
                            <td className="px-6 py-4 text-right">
                              {m.user.id !== user?.id && (
                                <button
                                  onClick={() => removeMember(m.user.id)}
                                  className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                  title="Remover"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {members.length === 0 && (
                    <div className="text-center py-8 text-foreground-muted">
                      <Users className="w-8 h-8 mx-auto mb-2 text-foreground-muted/50" />
                      <p className="text-body">Ainda não há membros na equipa</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Create Team Modal */}
            {showCreate && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6 w-full max-w-md mx-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-heading-3 text-foreground">Criar Equipa</h3>
                    <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-cream-100"><X className="w-5 h-5" /></button>
                  </div>
                  <form onSubmit={createTeam} className="space-y-4">
                    <div>
                      <label className="block text-overline text-foreground-muted uppercase tracking-wider mb-1.5">Nome da Equipa</label>
                      <input required value={newTeam.name} onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20" />
                    </div>
                    <div>
                      <label className="block text-overline text-foreground-muted uppercase tracking-wider mb-1.5">Slug (URL)</label>
                      <input required value={newTeam.slug} onChange={(e) => setNewTeam({ ...newTeam, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} placeholder="minha-equipa" className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20" />
                    </div>
                    <div>
                      <label className="block text-overline text-foreground-muted uppercase tracking-wider mb-1.5">Descrição</label>
                      <textarea value={newTeam.description} onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20" />
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                      <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2.5 rounded-xl text-body text-foreground-muted hover:bg-cream-100 transition-colors">Cancelar</button>
                      <button type="submit" className="px-5 py-2.5 bg-olive-500 text-white rounded-xl font-medium hover:bg-olive-600 transition-colors">Criar Equipa</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Invite Modal */}
            {showInvite && team && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6 w-full max-w-md mx-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-heading-3 text-foreground">Convidar Membro</h3>
                    <button onClick={() => setShowInvite(false)} className="p-1 rounded-lg hover:bg-cream-100"><X className="w-5 h-5" /></button>
                  </div>
                  <form onSubmit={inviteMember} className="space-y-4">
                    <div>
                      <label className="block text-overline text-foreground-muted uppercase tracking-wider mb-1.5">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                        <input required type="email" value={inviteData.email} onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-overline text-foreground-muted uppercase tracking-wider mb-1.5">Nome</label>
                      <input required value={inviteData.name} onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-overline text-foreground-muted uppercase tracking-wider mb-1.5">Função</label>
                        <select value={inviteData.role} onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20">
                          <option value="agent">Agente</option>
                          <option value="assistant">Assistente</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-overline text-foreground-muted uppercase tracking-wider mb-1.5">Comissão %</label>
                        <div className="relative">
                          <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                          <input type="number" min={0} max={100} value={inviteData.commissionRate} onChange={(e) => setInviteData({ ...inviteData, commissionRate: Number(e.target.value) })} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20" />
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                      <button type="button" onClick={() => setShowInvite(false)} className="px-4 py-2.5 rounded-xl text-body text-foreground-muted hover:bg-cream-100 transition-colors">Cancelar</button>
                      <button type="submit" className="px-5 py-2.5 bg-olive-500 text-white rounded-xl font-medium hover:bg-olive-600 transition-colors">Convidar</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
