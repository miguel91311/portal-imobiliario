import { Market } from '@/context/market-context';

export const MARKET_CONFIG: Record<Market, {
  name: string;
  flag: string;
  currency: string;
  locale: string;
  currencySymbol: string;
  calculator: 'imt' | 'ipu';
  legalFramework: string;
  agentLicense: string;
  supportPhone: string;
  supportAddress: string;
  cities: string[];
  neighborhoods: string[];
  ogLocale: string;
  metaTitle: string;
  metaDescription: string;
}> = {
  PT: {
    name: 'Portugal',
    flag: '🇵🇹',
    currency: 'EUR',
    locale: 'pt-PT',
    currencySymbol: '€',
    calculator: 'imt',
    legalFramework: 'Código Civil Português · DL 287/2003 · Regime IMT Jovem',
    agentLicense: 'AMI – Autoridade de Supervisão de Seguros e Fundos de Pensões',
    supportPhone: '+351 210 000 000',
    supportAddress: 'Av. da Liberdade, 245, 1250-096 Lisboa, Portugal',
    cities: ['Lisboa', 'Porto', 'Cascais', 'Algarve'],
    neighborhoods: ['Avenidas Novas', 'Centro Histórico', 'Cedofeita', 'Príncipe Real'],
    ogLocale: 'pt_PT',
    metaTitle: 'Portal Premium — Imobiliário de Luxo Portugal',
    metaDescription: 'Propriedades premium selecionadas em Lisboa, Porto e Cascais. Simulação IMT Jovem, avaliação preditiva e curadoria algorítmica.',
  },
  AO: {
    name: 'Angola',
    flag: '🇦🇴',
    currency: 'AOA',
    locale: 'pt-AO',
    currencySymbol: 'Kz',
    calculator: 'ipu',
    legalFramework: 'Lei de Terras 9/04 · Lei dos SPV 3/11 · Código do IPU',
    agentLicense: 'INOCOOP – Instituto de Condomínios e Cooperativas',
    supportPhone: '+244 923 000 000',
    supportAddress: 'Rua da Missão, 123, Miramar, Luanda, Angola',
    cities: ['Luanda', 'Benguela', 'Lubango', 'Talatona'],
    neighborhoods: ['Talatona', 'Ilha do Cabo', 'Miramar', 'Maianga'],
    ogLocale: 'pt_AO',
    metaTitle: 'Portal Premium — Imobiliário de Luxo Angola',
    metaDescription: 'Propriedades premium selecionadas em Luanda, Benguela e Lubango. Simulação IPU/Sisa, avaliação preditiva e curadoria algorítmica.',
  },
};

export function formatCurrency(value: number, currency: string): string {
  const formatter = new Intl.NumberFormat(
    currency === 'AOA' ? 'pt-AO' : 'pt-PT',
    { style: 'currency', currency, maximumFractionDigits: 0 }
  );
  return formatter.format(value);
}
