'use client';

import { useState, useCallback } from 'react';
import { Calculator, User, Home, Users, CheckCircle2, AlertCircle, Euro, Info, Mail, Phone, Send } from 'lucide-react';
import { useCalculation } from '@/hooks/use-calculation';

interface IMTJovemCalculatorProps {
  propertyId?: string;
}

export function IMTJovemCalculator({ propertyId }: IMTJovemCalculatorProps = {}) {
  const [propertyValue, setPropertyValue] = useState<number>(320000);
  const [buyerAge, setBuyerAge] = useState<number>(28);
  const [isFirstHome, setIsFirstHome] = useState(true);
  const [isResident, setIsResident] = useState(true);
  const [hasCoBuyers, setHasCoBuyers] = useState(false);
  const [coBuyers, setCoBuyers] = useState([{ age: 30, isFirstHome: true, share: 0.5 }]);
  
  // Lead capture fields
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadSaved, setLeadSaved] = useState(false);

  const { result, isLoading, error, calculate, saveSimulation } = useCalculation({ type: 'imt-jovem', propertyId });

  const handleCalculate = useCallback(async () => {
    const input = {
      propertyValue,
      buyerAge,
      isFirstHome,
      isResident,
      coBuyers: hasCoBuyers ? coBuyers : [],
    };
    const data = await calculate(input);
    if (data) {
      setShowLeadForm(true);
    }
  }, [propertyValue, buyerAge, isFirstHome, isResident, hasCoBuyers, coBuyers, calculate]);

  const handleSaveLead = async () => {
    if (!result) return;
    const input = {
      propertyValue,
      buyerAge,
      isFirstHome,
      isResident,
      coBuyers: hasCoBuyers ? coBuyers : [],
    };
    await saveSimulation(input, result, {
      name: leadName,
      email: leadEmail,
      phone: leadPhone,
    });
    setLeadSaved(true);
    setTimeout(() => setLeadSaved(false), 3000);
  };

  const addCoBuyer = () => {
    if (coBuyers.length < 2) {
      setCoBuyers([...coBuyers, { age: 30, isFirstHome: false, share: 0 }]);
    }
  };

  const updateCoBuyer = (index: number, field: string, value: number | boolean) => {
    const updated = [...coBuyers];
    updated[index] = { ...updated[index], [field]: value };
    setCoBuyers(updated);
  };

  return (
    <div className="bg-surface-elevated rounded-2xl border border-border shadow-card overflow-hidden">
      <div className="px-6 py-5 border-b border-border bg-cream-50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <Calculator className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-serif text-heading-3 text-foreground">Simulador IMT Jovem</h3>
            <p className="text-caption text-foreground-muted mt-0.5">Portugal · Isenção até 35 anos · 1ª Habitação Própria e Permanente</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-caption font-medium text-foreground">
            <Euro className="w-4 h-4 text-foreground-muted" />
            Valor do Imóvel (€)
          </label>
          <input type="range" min="50000" max="1000000" step="5000" value={propertyValue} onChange={(e) => setPropertyValue(Number(e.target.value))} className="w-full accent-accent" />
          <div className="flex items-center gap-3">
            <input type="number" value={propertyValue} onChange={(e) => setPropertyValue(Math.max(0, Number(e.target.value)))} className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-cream-50 text-body text-foreground focus:outline-none focus:border-olive-300 transition-all" />
            <span className="text-caption text-foreground-muted whitespace-nowrap">
              {propertyValue <= 330539 ? 'Até 4.º escalão' : propertyValue <= 660982 ? '5.º escalão' : 'Acima do limite'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-caption font-medium text-foreground">
              <User className="w-4 h-4 text-foreground-muted" />
              Idade do Comprador
            </label>
            <input type="number" min="18" max="99" value={buyerAge} onChange={(e) => setBuyerAge(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-border bg-cream-50 text-body text-foreground focus:outline-none focus:border-olive-300 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-caption font-medium text-foreground">
              <Home className="w-4 h-4 text-foreground-muted" />
              Residente em PT
            </label>
            <div className="flex gap-2">
              <button onClick={() => setIsResident(true)} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isResident ? 'bg-olive-500 text-white' : 'bg-cream-200 text-foreground-muted hover:bg-cream-300'}`}>Sim</button>
              <button onClick={() => setIsResident(false)} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${!isResident ? 'bg-olive-500 text-white' : 'bg-cream-200 text-foreground-muted hover:bg-cream-300'}`}>Não</button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isFirstHome} onChange={(e) => setIsFirstHome(e.target.checked)} className="w-5 h-5 rounded border-border text-accent focus:ring-accent" />
            <span className="text-body text-foreground">Primeira Habitação Própria e Permanente (HPP)</span>
          </label>
        </div>

        <div className="pt-2 border-t border-border">
          <label className="flex items-center gap-2 cursor-pointer mb-3">
            <input type="checkbox" checked={hasCoBuyers} onChange={(e) => setHasCoBuyers(e.target.checked)} className="w-5 h-5 rounded border-border text-accent focus:ring-accent" />
            <span className="text-body text-foreground font-medium">Compra em compropriedade</span>
            <Users className="w-4 h-4 text-foreground-muted ml-1" />
          </label>

          {hasCoBuyers && (
            <div className="space-y-3">
              {coBuyers.map((buyer, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-cream-50 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-caption font-medium text-foreground-muted">Co-titular {idx + 1}</span>
                    <input type="number" min="0" max="100" value={(buyer.share * 100)} onChange={(e) => updateCoBuyer(idx, 'share', Number(e.target.value) / 100)} className="w-20 px-2 py-1 rounded-lg border border-border bg-white text-center text-caption" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Idade" value={buyer.age} onChange={(e) => updateCoBuyer(idx, 'age', Number(e.target.value))} className="px-3 py-2 rounded-lg border border-border bg-white text-sm" />
                    <select value={buyer.isFirstHome ? 'yes' : 'no'} onChange={(e) => updateCoBuyer(idx, 'isFirstHome', e.target.value === 'yes')} className="px-3 py-2 rounded-lg border border-border bg-white text-sm">
                      <option value="yes">1ª Habitação</option>
                      <option value="no">Não é 1ª</option>
                    </select>
                  </div>
                </div>
              ))}
              {coBuyers.length < 2 && (
                <button onClick={addCoBuyer} className="text-sm text-accent hover:text-accent-dark font-medium">+ Adicionar co-titular</button>
              )}
            </div>
          )}
        </div>

        <button onClick={handleCalculate} disabled={isLoading} className="w-full btn-primary gap-2 disabled:opacity-60">
          {isLoading ? 'A calcular...' : 'Calcular IMT Jovem'}
          <Calculator className="w-4 h-4" />
        </button>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">{error}</div>
        )}
      </div>

      {/* Resultado */}
      {result && (
        <div className="px-6 py-6 bg-cream-50 border-t border-border">
          <div className={`p-5 rounded-xl border ${result.eligible ? 'border-emerald-200 bg-emerald-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
            <div className="flex items-start gap-3 mb-4">
              {result.eligible ? <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />}
              <div>
                <h4 className={`font-serif text-heading-3 ${result.eligible ? 'text-emerald-800' : 'text-amber-800'}`}>
                  {result.eligible ? 'Elegível para IMT Jovem' : 'Regime Geral de IMT'}
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-white rounded-xl border border-border">
                <p className="text-overline text-foreground-muted uppercase">IMT a Pagar</p>
                <p className="font-serif text-heading-2 text-foreground mt-1">{result.imtPayable.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-border">
                <p className="text-overline text-foreground-muted uppercase">Imposto do Selo</p>
                <p className="font-serif text-heading-2 text-foreground mt-1">{result.stampDuty.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-border">
              <div className="flex items-center justify-between">
                <span className="text-body font-medium text-foreground">Total em Impostos</span>
                <span className="font-serif text-heading-2 text-accent">{result.totalTax.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</span>
              </div>
              <div className="mt-2 text-right">
                <span className="text-caption text-foreground-muted">Taxa efetiva: {(result.effectiveRate * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* Lead Capture */}
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
