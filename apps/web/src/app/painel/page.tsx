import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/landing/footer';
import { Shield, Briefcase, Home, ArrowRight } from 'lucide-react';

const profiles = [
  {
    role: 'admin' as const,
    title: 'Administração',
    subtitle: 'Backoffice de Moderação & Compliance',
    desc: 'Gestão KYC, auditoria de fraude, logs de conformidade e relatórios executivos DaaS.',
    icon: Shield,
    color: 'bg-olive-500',
    href: '/painel/admin',
  },
  {
    role: 'agente' as const,
    title: 'Área do Agente',
    subtitle: 'Broker Dashboard B2B',
    desc: 'Lead scoring preditivo, gamificação de performance, co-broking e gestão de destaques premium.',
    icon: Briefcase,
    color: 'bg-accent',
    href: '/painel/agente',
  },
  {
    role: 'proprietario' as const,
    title: 'Área do Proprietário',
    subtitle: 'Homeowner Dashboard',
    desc: 'Property Passport digital, alertas AVM de valorização, desempenho de anúncios e Sprint 24h.',
    icon: Home,
    color: 'bg-teal-600',
    href: '/painel/proprietario',
  },
];

export default function PainelSelectorPage() {
  return (
    <main className="min-h-screen bg-cream-100">
      <Navbar />
      <div className="pt-32 pb-20">
        <div className="luxury-container max-w-4xl">
          <div className="text-center mb-16">
            <h1 className="font-serif text-display text-foreground mb-4">Painéis Operacionais</h1>
            <p className="text-body-large text-foreground-muted max-w-xl mx-auto">
              Selecione o perfil de acesso adequado às suas funções na plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {profiles.map((p) => (
              <Link
                key={p.role}
                href={p.href}
                className="group p-8 rounded-2xl bg-surface-elevated border border-border shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-500 ease-luxury"
              >
                <div className={`w-14 h-14 rounded-xl ${p.color} flex items-center justify-center mb-6`}>
                  <p.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-serif text-heading-2 text-foreground mb-1">{p.title}</h3>
                <p className="text-overline text-foreground-muted uppercase tracking-wider mb-4">{p.subtitle}</p>
                <p className="text-body text-foreground-muted leading-relaxed mb-6">{p.desc}</p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-olive-500 group-hover:text-accent transition-colors">
                  Aceder <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
