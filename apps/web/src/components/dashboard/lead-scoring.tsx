'use client';

import { useState } from 'react';
import { Star, Phone, Mail, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  propertyInterest: string;
  score: number;
  status: 'hot' | 'warm' | 'cold';
  lastAction: string;
  actions: string[];
}

const mockLeads: Lead[] = [
  { id: 'L-101', name: 'Dr. Ricardo Silva', email: 'r.silva@familyoffice.pt', propertyInterest: 'Palacete Cascais', score: 94, status: 'hot', lastAction: 'Download brochura', actions: ['phone', 'email', 'visit'] },
  { id: 'L-102', name: 'Ana Luísa Mendes', email: 'ana.m@luanda.co.ao', propertyInterest: 'Talatona T5', score: 87, status: 'hot', lastAction: 'Agendou visita 3D', actions: ['phone', 'email'] },
  { id: 'L-103', name: 'Carlos Tavares', email: 'ctavares@gmail.com', propertyInterest: 'Loft Porto', score: 62, status: 'warm', lastAction: 'Visualização >5min', actions: ['email'] },
  { id: 'L-104', name: 'Maria João Pinto', email: 'mjpinto@hotmail.com', propertyInterest: 'Penthouse Lisboa', score: 45, status: 'cold', lastAction: 'Registo newsletter', actions: ['email'] },
  { id: 'L-105', name: 'Eng. Paulo Ferreira', email: 'paulo.f@construtora.ao', propertyInterest: 'Miramar Vila', score: 78, status: 'warm', lastAction: 'Pediu simulação IPU', actions: ['phone', 'email', 'visit'] },
];

export function LeadScoring() {
  const [leads] = useState(mockLeads);

  const getStatusConfig = (status: Lead['status']) => {
    switch (status) {
      case 'hot': return { color: 'bg-red-50 text-red-700 border-red-100', icon: TrendingUp, label: 'Quente' };
      case 'warm': return { color: 'bg-amber-50 text-amber-700 border-amber-100', icon: Minus, label: 'Morno' };
      case 'cold': return { color: 'bg-slate-50 text-slate-600 border-slate-100', icon: TrendingDown, label: 'Frio' };
    }
  };

  return (
    <div className="bg-surface-elevated rounded-2xl border border-border shadow-card overflow-hidden">
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-heading-3 text-foreground">Lead Scoring Preditivo</h3>
            <p className="text-caption text-foreground-muted mt-0.5">AI-based qualification · Comportamento · Intenção</p>
          </div>
          <span className="px-3 py-1 bg-olive-50 text-olive-700 rounded-full text-overline">
            {leads.filter((l) => l.status === 'hot').length} Hot Leads
          </span>
        </div>
      </div>
      <div className="divide-y divide-border">
        {leads.map((lead) => {
          const config = getStatusConfig(lead.status);
          const StatusIcon = config.icon;
          return (
            <div key={lead.id} className="p-5 hover:bg-cream-50/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-medium text-foreground truncate">{lead.name}</h4>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-overline border ${config.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {config.label}
                    </span>
                  </div>
                  <p className="text-caption text-foreground-muted mb-2">{lead.email}</p>
                  <div className="flex items-center gap-2 text-caption text-foreground-muted">
                    <span className="px-2 py-0.5 bg-cream-200 rounded text-xs">{lead.propertyInterest}</span>
                    <span>·</span>
                    <span>{lead.lastAction}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 mb-1 justify-end">
                    <Star className="w-4 h-4 text-accent fill-accent" />
                    <span className="font-serif text-heading-2 text-foreground">{lead.score}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {lead.actions.includes('phone') && (
                      <button className="p-1.5 rounded-lg hover:bg-cream-200 text-foreground-muted transition-colors"><Phone className="w-3.5 h-3.5" /></button>
                    )}
                    {lead.actions.includes('email') && (
                      <button className="p-1.5 rounded-lg hover:bg-cream-200 text-foreground-muted transition-colors"><Mail className="w-3.5 h-3.5" /></button>
                    )}
                    {lead.actions.includes('visit') && (
                      <button className="p-1.5 rounded-lg hover:bg-cream-200 text-foreground-muted transition-colors"><Calendar className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
