'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Navbar } from '@/components/navbar';
import { FooterSimple } from '@/components/footer-simple';
import { Eye, EyeOff, Lock, Mail, User, Building2, ArrowRight, Check } from 'lucide-react';

const PLANS = [
  { id: 'starter', name: 'Starter', price: 20, listings: 5 },
  { id: 'pro', name: 'Pro', price: 35, listings: 10 },
  { id: 'enterprise', name: 'Enterprise', price: 60, listings: 30 },
];

function RegistoAgenteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planoUrl = searchParams.get('plano');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agency, setAgency] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(planoUrl || 'starter');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (planoUrl && PLANS.find((p) => p.id === planoUrl)) {
      setSelectedPlan(planoUrl);
    }
  }, [planoUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As palavras-passe não coincidem.');
      return;
    }
    if (password.length < 6) {
      setError('A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.register({
        email,
        password,
        name,
        role: 'agent',
        country: 'PT',
        agency: agency || undefined,
        planType: selectedPlan,
      });
      localStorage.setItem('portal_token', res.token);
      setSuccess(true);
      setTimeout(() => {
        router.push('/painel/agente');
      }, 1500);
    } catch (err: any) {
      setError(err?.data?.error || 'Erro ao criar conta. Tenta novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const planInfo = PLANS.find((p) => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-cream-100">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="max-w-xl mx-auto px-6">
          <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-8">
            <div className="text-center mb-8">
              <h1 className="font-serif text-heading-1 text-foreground mb-2">Registar como Agente</h1>
              <p className="text-body text-foreground-muted">
                Cria a tua conta e começa a gerir os teus imóveis no Portal Premium
              </p>
            </div>

            {success ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="font-serif text-2xl text-foreground mb-2">Conta criada com sucesso!</h2>
                <p className="text-body text-foreground-muted">A redirecionar para o teu painel...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Plano selecionado */}
                <div className="p-4 bg-cream-100 rounded-xl border border-border">
                  <label className="block text-overline text-foreground-muted uppercase tracking-wider mb-2">Plano escolhido</label>
                  <select
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-olive-500/20"
                  >
                    {PLANS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.price}€/mês ({p.listings} imóveis)
                      </option>
                    ))}
                  </select>
                  {planInfo && (
                    <p className="text-xs text-foreground-muted mt-2">
                      O pagamento do primeiro mês será processado após a criação da conta. Em demonstração, todos os planos são gratuitos.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-caption font-medium text-foreground">Nome completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Carlos Mendes"
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-cream-50 text-body text-foreground focus:outline-none focus:border-olive-300 focus:ring-1 focus:ring-olive-300 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-caption font-medium text-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="carlos@email.pt"
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-cream-50 text-body text-foreground focus:outline-none focus:border-olive-300 focus:ring-1 focus:ring-olive-300 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-caption font-medium text-foreground">Agência (opcional)</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                    <input
                      type="text"
                      value={agency}
                      onChange={(e) => setAgency(e.target.value)}
                      placeholder="Ex: OLCapital Premium"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-cream-50 text-body text-foreground focus:outline-none focus:border-olive-300 focus:ring-1 focus:ring-olive-300 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-caption font-medium text-foreground">Palavra-passe</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      className="w-full pl-12 pr-12 py-3 rounded-xl border border-border bg-cream-50 text-body text-foreground focus:outline-none focus:border-olive-300 focus:ring-1 focus:ring-olive-300 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-caption font-medium text-foreground">Confirmar palavra-passe</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repete a palavra-passe"
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-cream-50 text-body text-foreground focus:outline-none focus:border-olive-300 focus:ring-1 focus:ring-olive-300 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-olive-500 text-white rounded-xl font-medium hover:bg-olive-600 transition-colors disabled:opacity-60"
                >
                  {isLoading ? 'A criar conta...' : 'Criar conta'}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-2">
                  <p className="text-sm text-foreground-muted">
                    Já tens conta?{' '}
                    <Link href="/auth/login" className="text-olive-500 hover:text-accent transition-colors">
                      Entrar
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <FooterSimple />
    </div>
  );
}

export default function RegistoAgentePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-100 flex items-center justify-center"><div className="w-8 h-8 border-2 border-olive-200 border-t-olive-500 rounded-full animate-spin" /></div>}>
      <RegistoAgenteForm />
    </Suspense>
  );
}
