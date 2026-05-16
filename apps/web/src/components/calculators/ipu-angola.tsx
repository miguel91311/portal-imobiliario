'use client';

import { useState, useCallback } from 'react';
import { Calculator, Building, MapPin, Home, AlertCircle, CheckCircle2, Info, User, Mail, Phone, Send } from 'lucide-react';
import { useCalculation } from '@/hooks/use-calculation';

interface IPUAngolaCalculatorProps {
  propertyId?: string;
}

export function IPUAngolaCalculator({ propertyId }: IPUAngolaCalculatorProps = {}) {
  const [propertyValue, setPropertyValue] = useState<number>(45_000_000);
  const [propertyType, setPropertyType] = useState<'occupied' | 'vacant'>('occupied');
  const [location, setLocation] = useState<'mainland' | 'cabinda'>('mainland');
  const [isExemptSisa, setIsExemptSisa] = useState(false);
  
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadSaved, setLeadSaved] = useState(false);

  const { result, isLoading, error, calculate, saveSimulation } = useCalculation({ type: 'ipu-angola', propertyId });

  const handleCalculate = useCallback(async () => {
    const input = { propertyValue, propertyType, location, isExemptSisa };
    const data = await calculate(input);
    if (data) setShowLeadForm(true);
  }, [propertyValue, propertyType, location, isExemptSisa, calculate]);

  const handleSaveLead = async () => {
    if (!result) return;
    await saveSimulation(
      { propertyValue, propertyType, location, isExemptSisa },
      result,
      { name: leadName, email: leadEmail, phone: leadPhone }
    );
    setLeadSaved(true);
    setTimeout(() => setLeadSaved(false), 3000);
  };

  return (
    <div className="bg-surface-elevated rounded-2xl border border-border shadow-card overflow-hidden">
      <div className="px-6 py-5 border-b border-border bg-cream-50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-olive-100">
            <Calculator className="w-5 h-5 text-olive-500" />
          </div>
          <div>
            <h3 className="font-serif text-heading-3 text-foreground">Simulador IPU & Sisa</h3>
            <p className="text-caption text-foreground-muted mt-0.5">Angola · Imposto Predial Urbano · Taxa de Transação Civil</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-caption font-medium text-foreground">
            <Building className="w-4 h-4 text-foreground-muted" />
            Valor Patrimonial / Transacional (Kz)
          </label>
          <input type="range" min="5000000" max="500000000" step="1000000" value={propertyValue} onChange={(e) => setPropertyValue(Number(e.target.value))} className="w-full accent-olive-500" />
          <input type="number" value={propertyValue} onChange={(e) => setPropertyValue(Math.max(0, Number(e.target.value)))} className="w-full px-4 py-2.5 rounded-xl border border-border bg-cream-50 text-body text-foreground focus:outline-none focus:border-olive-300 transition-all" />
          <p className="text-caption text-foreground-muted">
            {propertyValue <= 40_000_000 ? '≤ 40.000.000 Kz — Isento de Sisa' : '> 40.000.000 Kz — Taxa de transação civil aplicável'}
          </p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-caption font-medium text-foreground">
            <Home className="w-4 h-4 text-foreground-muted" />
            Estado de Ocupação
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setPropertyType('occupied')} className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${propertyType === 'occupied' ? 'bg-olive-500 text-white border-olive-500' : 'bg-cream-50 text-foreground-muted border-border hover:border-olive-300'}`}>Ocupada / Habitada</button>
            <button onClick={() => setPropertyType('vacant')} className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${propertyType === 'vacant' ? 'bg-olive-500 text-white border-olive-500' : 'bg-cream-50 text-foreground-muted border-border hover:border-olive-300'}`}>Desocupada / Devoluta</button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-caption font-medium text-foreground">
            <MapPin className="w-4 h-4 text-foreground-muted" />
            Localização
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setLocation('mainland')} className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${location === 'mainland' ? 'bg-olive-500 text-white border-olive-500' : 'bg-cream-50 text-foreground-muted border-border hover:border-olive-300'}`}>Território Continental</button>
            <button onClick={() => setLocation('cabinda')} className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${location === 'cabinda' ? 'bg-olive-500 text-white border-olive-500' : 'bg-cream-50 text-foreground-muted border-border hover:border-olive-300'}`}>Cabinda (Regime Especial)</button>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isExemptSisa} onChange={(e) => setIsExemptSisa(e.target.checked)} className="w-5 h-5 rounded border-border text-olive-500 focus:ring-olive-500" />
          <span className="text-body text-foreground">Isenção especial de Sisa (certificada)</span>
        </label>

        <button onClick={handleCalculate} disabled={isLoading} className="w-full btn-primary gap-2 disabled:opacity-60">
          {isLoading ? 'A calcular...' : 'Calcular IPU & Sisa'}
          <Calculator className="w-4 h-4" />
        </button>

        {error && <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">{error}</div>}
      </div>

      {result && (
        <div className="px-6 py-6 bg-cream-50 border-t border-border">
          <div className={`p-5 rounded-xl border ${result.totalTax === 0 ? 'border-emerald-200 bg-emerald-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
            <div className="flex items-start gap-3 mb-4">
              {result.totalTax === 0 ? <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />}
              <div>
                <h4 className={`font-serif text-heading-3 ${result.totalTax === 0 ? 'text-emerald-800' : 'text-amber-800'}`}>
                  {result.totalTax === 0 ? 'Isento de Tributação' : 'Tributação Aplicável'}
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-white rounded-xl border border-border">
                <p className="text-overline text-foreground-muted uppercase">Sisa</p>
                <p className="font-serif text-heading-2 text-foreground mt-1">{result.sisaPayable.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-border">
                <p className="text-overline text-foreground-muted uppercase">IPU</p>
                <p className="font-serif text-heading-2 text-foreground mt-1">{result.ipuPayable.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-border">
              <div className="flex items-center justify-between">
                <span className="text-body font-medium text-foreground">Total em Impostos</span>
                <span className="font-serif text-heading-2 text-olive-500">{result.totalTax.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz</span>
              </div>
              <div className="mt-2 text-right">
                <span className="text-caption text-foreground-muted">Taxa efetiva: {(result.effectiveRate * 100).toFixed(3)}%</span>
              </div>
            </div>
          </div>

          {showLeadForm && !leadSaved && (
            <div className="mt-6 p-5 rounded-xl bg-white border border-border">
              <h4 className="font-serif text-heading-3 text-foreground mb-3">Receber proposta detalhada</h4>
              <p className="text-caption text-foreground-muted mb-4">Deixe os seus dados e um consultor fiscal entrará em contacto consigo.</p>
              <div className="space-y-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                  <input type="text" placeholder="Nome completo" value={leadName} onChange={(e) => setLeadName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-cream-50 text-sm focus:outline-none focus:border-olive-300" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                  <input type="email" placeholder="Email" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-cream-50 text-sm focus:outline-none focus:border-olive-300" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                  <input type="tel" placeholder="Telefone" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-cream-50 text-sm focus:outline-none focus:border-olive-300" />
                </div>
                <button onClick={handleSaveLead} className="w-full btn-primary gap-2">
                  <Send className="w-4 h-4" />
                  Receber Proposta
                </button>
              </div>
            </div>
          )}

          {leadSaved && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-center">
              <CheckCircle2 className="w-5 h-5 mx-auto mb-1" />
              <p className="text-sm font-medium">Simulação guardada. Um consultor entrará em contacto brevemente.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
