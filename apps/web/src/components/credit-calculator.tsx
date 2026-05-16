'use client';

import { useState, useCallback } from 'react';
import { Calculator, Home, Wallet, Clock, Percent, TrendingUp, CheckCircle2, AlertCircle, User, Building, Send, Mail, Phone } from 'lucide-react';
import { api } from '@/lib/api';

interface CreditCalculatorProps {
  market: 'PT' | 'AO';
  propertyValue?: number;
}

export function CreditCalculator({ market, propertyValue = 320000 }: CreditCalculatorProps) {
  const isPT = market === 'PT';
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadSaved, setLeadSaved] = useState(false);

  // PT form state
  const [downPayment, setDownPayment] = useState(Math.round(propertyValue * 0.2));
  const [years, setYears] = useState(30);
  const [spread, setSpread] = useState(1.2);
  const [fixedRate, setFixedRate] = useState(false);
  const [age, setAge] = useState(32);
  const [monthlyIncome, setMonthlyIncome] = useState(2500);
  const [otherDebts, setOtherDebts] = useState(0);

  // AO form state
  const [interestRate, setInterestRate] = useState(15.5);
  const [isDiaspora, setIsDiaspora] = useState(false);

  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');

  const handleCalculate = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const body = {
        propertyValue,
        downPayment,
        years,
        monthlyIncome,
        otherDebts,
        ...(isPT ? { spread, fixedRate, age } : { interestRate, isDiaspora }),
      };
      const res = isPT ? await api.calculateCreditPT(body) : await api.calculateCreditAO(body);
      setResult(res);
      setShowLeadForm(true);
    } catch (err: any) {
      setError(err?.data?.error || 'Erro ao calcular');
    } finally {
      setLoading(false);
    }
  }, [isPT, propertyValue, downPayment, years, spread, fixedRate, age, monthlyIncome, otherDebts, interestRate, isDiaspora]);

  const handleSaveLead = async () => {
    setLeadSaved(true);
    setTimeout(() => setLeadSaved(false), 3000);
  };

  const ltv = ((propertyValue - downPayment) / propertyValue) * 100;

  return (
    <div className="bg-surface-elevated rounded-2xl border border-border shadow-card overflow-hidden">
      <div className="px-6 py-5 border-b border-border bg-cream-50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <Building className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-serif text-heading-3 text-foreground">
              Simulação Crédito Habitação
            </h3>
            <p className="text-caption text-foreground-muted mt-0.5">
              {isPT ? 'Portugal · EURIBOR 6M + Spread · TAEG' : 'Angola · Taxa BNA · Financiamento'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-caption font-medium text-foreground">
              <Home className="w-4 h-4 text-foreground-muted" />
              Valor do Imóvel
            </label>
            <input type="number" value={propertyValue} disabled className="w-full px-4 py-2.5 rounded-xl border border-border bg-cream-100 text-body text-foreground opacity-70" />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-caption font-medium text-foreground">
              <Wallet className="w-4 h-4 text-foreground-muted" />
              Entrada Inicial
            </label>
            <input type="number" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-border bg-cream-50 text-body text-foreground focus:outline-none focus:border-olive-300" />
            <p className="text-xs text-foreground-muted">LTV: {ltv.toFixed(1)}%</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-caption font-medium text-foreground">
              <Clock className="w-4 h-4 text-foreground-muted" />
              Prazo (anos)
            </label>
            <input type="range" min="5" max={isPT ? 40 : 25} value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full accent-accent" />
            <div className="text-center text-caption text-foreground">{years} anos</div>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-caption font-medium text-foreground">
              <TrendingUp className="w-4 h-4 text-foreground-muted" />
              Rendimento Mensal
            </label>
            <input type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-border bg-cream-50 text-body text-foreground focus:outline-none focus:border-olive-300" />
          </div>
        </div>

        {isPT ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-caption font-medium text-foreground">
                  <Percent className="w-4 h-4 text-foreground-muted" />
                  Spread (%)
                </label>
                <input type="number" step="0.05" value={spread} onChange={(e) => setSpread(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-border bg-cream-50 text-body text-foreground focus:outline-none focus:border-olive-300" />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-caption font-medium text-foreground">
                  <User className="w-4 h-4 text-foreground-muted" />
                  Idade
                </label>
                <input type="number" min="18" max="80" value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-border bg-cream-50 text-body text-foreground focus:outline-none focus:border-olive-300" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={fixedRate} onChange={(e) => setFixedRate(e.target.checked)} className="w-5 h-5 rounded border-border text-accent" />
              <span className="text-body text-foreground">Taxa Fixa</span>
            </label>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-caption font-medium text-foreground">
                  <Percent className="w-4 h-4 text-foreground-muted" />
                  Taxa de Juro (%)
                </label>
                <input type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-border bg-cream-50 text-body text-foreground focus:outline-none focus:border-olive-300" />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-caption font-medium text-foreground">
                  <Wallet className="w-4 h-4 text-foreground-muted" />
                  Outras Dívidas
                </label>
                <input type="number" value={otherDebts} onChange={(e) => setOtherDebts(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-border bg-cream-50 text-body text-foreground focus:outline-none focus:border-olive-300" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isDiaspora} onChange={(e) => setIsDiaspora(e.target.checked)} className="w-5 h-5 rounded border-border text-accent" />
              <span className="text-body text-foreground">Diáspora (condições especiais BNA)</span>
            </label>
          </>
        )}

        <button onClick={handleCalculate} disabled={loading} className="w-full btn-primary gap-2 disabled:opacity-60">
          {loading ? 'A calcular...' : 'Simular Crédito'}
          <Calculator className="w-4 h-4" />
        </button>

        {error && <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">{error}</div>}
      </div>

      {result && (
        <div className="px-6 py-6 bg-cream-50 border-t border-border">
          <div className={`p-5 rounded-xl border ${result.approved ? 'border-emerald-200 bg-emerald-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
            <div className="flex items-start gap-3 mb-4">
              {result.approved ? <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />}
              <div>
                <h4 className={`font-serif text-heading-3 ${result.approved ? 'text-emerald-800' : 'text-amber-800'}`}>
                  {result.approved ? 'Pré-Aprovado' : 'Não Pré-Aprovado'}
                </h4>
                <p className="text-caption text-foreground-muted mt-1">
                  TAEG: {result.taeg.toFixed(2)}% · {result.numPayments} prestações
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-white rounded-xl border border-border">
                <p className="text-overline text-foreground-muted uppercase">Prestação Mensal</p>
                <p className="font-serif text-heading-2 text-foreground mt-1">
                  {result.monthlyPayment.toLocaleString('pt-PT', { style: 'currency', currency: isPT ? 'EUR' : 'AOA' })}
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-border">
                <p className="text-overline text-foreground-muted uppercase">Montante Financiado</p>
                <p className="font-serif text-heading-2 text-foreground mt-1">
                  {result.loanAmount.toLocaleString('pt-PT', { style: 'currency', currency: isPT ? 'EUR' : 'AOA' })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 bg-white rounded-lg border border-border">
                <p className="text-overline text-foreground-muted">Juros Totais</p>
                <p className="font-medium text-foreground">{result.totalInterest.toLocaleString('pt-PT', { style: 'currency', currency: isPT ? 'EUR' : 'AOA', maximumFractionDigits: 0 })}</p>
              </div>
              <div className="p-2 bg-white rounded-lg border border-border">
                <p className="text-overline text-foreground-muted">LTV</p>
                <p className="font-medium text-foreground">{result.ltv}%</p>
              </div>
              <div className="p-2 bg-white rounded-lg border border-border">
                <p className="text-overline text-foreground-muted">DSTI</p>
                <p className={`font-medium ${result.dsti > 35 ? 'text-red-600' : 'text-emerald-600'}`}>{result.dsti}%</p>
              </div>
            </div>
          </div>

          {showLeadForm && !leadSaved && (
            <div className="mt-6 p-5 rounded-xl bg-white border border-border">
              <h4 className="font-serif text-heading-3 text-foreground mb-3">Receber proposta de banco</h4>
              <div className="space-y-3">
                <input type="text" placeholder="Nome completo" value={leadName} onChange={(e) => setLeadName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-cream-50 text-sm" />
                <input type="email" placeholder="Email" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-cream-50 text-sm" />
                <input type="tel" placeholder="Telefone" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-cream-50 text-sm" />
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
              <p className="text-sm font-medium">Pedido enviado. Um consultor bancário entrará em contacto.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
