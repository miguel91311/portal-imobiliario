import { User, Phone, Mail, Award } from 'lucide-react';

interface AgentCardProps {
  agent: {
    name: string;
    agency: string;
    image?: string;
  };
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-surface-elevated border border-border shadow-card">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-16 h-16 rounded-full bg-cream-200 flex items-center justify-center shrink-0">
          {agent.image ? (
            <img src={agent.image} alt={agent.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <User className="w-7 h-7 text-olive-500" />
          )}
        </div>
        <div>
          <h4 className="font-serif text-heading-3 text-foreground">{agent.name}</h4>
          <div className="flex items-center gap-1.5 mt-1">
            <Award className="w-3.5 h-3.5 text-accent" />
            <span className="text-caption text-foreground-muted">{agent.agency}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <button className="w-full btn-primary gap-2">
          <Phone className="w-4 h-4" />
          Contactar Agente
        </button>
        <button className="w-full btn-ghost gap-2">
          <Mail className="w-4 h-4" />
          Enviar Mensagem
        </button>
      </div>

      <div className="mt-5 pt-4 border-t border-border">
        <p className="text-caption text-foreground-muted text-center">
          Mediador certificado IMPIC / APIMA
        </p>
      </div>
    </div>
  );
}
