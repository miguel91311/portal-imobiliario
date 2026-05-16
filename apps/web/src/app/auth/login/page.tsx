'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Navbar } from '@/components/navbar';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      router.push('/painel');
    } catch (err: any) {
      setError(err?.data?.error || 'Credenciais inválidas. Tente admin@portalpremium.pt / password123');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream-100">
      <Navbar />
      <div className="pt-32 pb-20">
        <div className="luxury-container max-w-md mx-auto">
          <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-8">
            <div className="text-center mb-8">
              <h1 className="font-serif text-heading-1 text-foreground mb-2">Bem-vindo de volta</h1>
              <p className="text-body text-foreground-muted">Entre na sua conta para aceder aos painéis operacionais</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-caption font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@portalpremium.pt"
                    required
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
                    placeholder="••••••••"
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary gap-2 disabled:opacity-60"
              >
                {isLoading ? 'A entrar...' : 'Entrar'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-caption text-foreground-muted text-center mb-4">Credenciais de demonstração</p>
              <div className="space-y-2 text-xs text-foreground-muted font-mono bg-cream-50 p-4 rounded-xl">
                <p>admin@portalpremium.pt / password123</p>
                <p>carlos@olcapital.ao / password123</p>
                <p>ricardo.silva@email.pt / password123</p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-olive-500 hover:text-accent transition-colors">
                ← Voltar ao site
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
