'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, FileText, Eye } from 'lucide-react';

interface KYCRequest {
  id: string;
  agency: string;
  country: 'PT' | 'AO';
  licenseId: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  risk: 'low' | 'medium' | 'high';
  documents: number;
}

const mockKYC: KYCRequest[] = [
  { id: 'KYC-001', agency: 'OLCapital Premium', country: 'AO', licenseId: 'APIMA-2847', submittedAt: '2026-05-08', status: 'pending', risk: 'low', documents: 5 },
  { id: 'KYC-002', agency: 'Private Selection Portugal', country: 'PT', licenseId: 'IMPIC-9921', submittedAt: '2026-05-07', status: 'approved', risk: 'low', documents: 4 },
  { id: 'KYC-003', agency: 'GM Imobiliária', country: 'AO', licenseId: 'APIMA-1102', submittedAt: '2026-05-06', status: 'pending', risk: 'medium', documents: 3 },
  { id: 'KYC-004', agency: 'Imobiliária Casa dos Sonhos', country: 'AO', licenseId: 'APIMA-4451', submittedAt: '2026-05-05', status: 'rejected', risk: 'high', documents: 2 },
  { id: 'KYC-005', agency: 'Sotheby\'s Portugal', country: 'PT', licenseId: 'IMPIC-7734', submittedAt: '2026-05-04', status: 'approved', risk: 'low', documents: 6 },
];

export function KYCTable() {
  const [data, setData] = useState(mockKYC);

  const updateStatus = (id: string, status: 'approved' | 'rejected') => {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  return (
    <div className="bg-surface-elevated rounded-2xl border border-border shadow-card overflow-hidden">
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-serif text-heading-3 text-foreground">Moderação KYC</h3>
          <p className="text-caption text-foreground-muted mt-0.5">Validação cruzada IMPIC / APIMA / INH</p>
        </div>
        <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-overline">
          {data.filter((d) => d.status === 'pending').length} Pendentes
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-cream-50">
              <th className="text-left px-6 py-3 text-overline text-foreground-muted uppercase tracking-wider">Agência</th>
              <th className="text-left px-6 py-3 text-overline text-foreground-muted uppercase tracking-wider">País</th>
              <th className="text-left px-6 py-3 text-overline text-foreground-muted uppercase tracking-wider">Licença</th>
              <th className="text-left px-6 py-3 text-overline text-foreground-muted uppercase tracking-wider">Risco</th>
              <th className="text-left px-6 py-3 text-overline text-foreground-muted uppercase tracking-wider">Estado</th>
              <th className="text-right px-6 py-3 text-overline text-foreground-muted uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b border-border hover:bg-cream-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cream-200 flex items-center justify-center text-overline font-medium text-olive-500">
                      {row.agency.charAt(0)}
                    </div>
                    <span className="font-medium text-foreground">{row.agency}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-overline ${row.country === 'PT' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                    {row.country === 'PT' ? 'Portugal' : 'Angola'}
                  </span>
                </td>
                <td className="px-6 py-4 text-foreground-muted font-mono text-xs">{row.licenseId}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-overline ${
                      row.risk === 'low'
                        ? 'bg-emerald-50 text-emerald-700'
                        : row.risk === 'medium'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    <AlertCircle className="w-3 h-3" />
                    {row.risk === 'low' ? 'Baixo' : row.risk === 'medium' ? 'Médio' : 'Alto'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-overline ${
                      row.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700'
                        : row.status === 'rejected'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {row.status === 'approved' ? <CheckCircle2 className="w-3 h-3" /> : row.status === 'rejected' ? <XCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {row.status === 'approved' ? 'Aprovado' : row.status === 'rejected' ? 'Recusado' : 'Pendente'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 rounded-lg hover:bg-cream-200 text-foreground-muted transition-colors" title="Ver documentos">
                      <FileText className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-cream-200 text-foreground-muted transition-colors" title="Detalhes">
                      <Eye className="w-4 h-4" />
                    </button>
                    {row.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(row.id, 'approved')}
                          className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                          title="Aprovar"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateStatus(row.id, 'rejected')}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="Recusar"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
