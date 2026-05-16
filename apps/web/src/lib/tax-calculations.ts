/**
 * Motor fiscal transfronteiriço — Portugal & Angola
 * Implementação fiel aos quadros fiscais descritos no relatório.
 */

/* ─── PORTUGAL: IMT Jovem ─── */

interface IMTJovemInput {
  propertyValue: number;        // valor da propriedade em EUR
  buyerAge: number;             // idade do comprador
  isFirstHome: boolean;         // primeira HPP?
  isResident: boolean;          // residente em PT?
  coBuyers: Array<{
    age: number;
    isFirstHome: boolean;
    share: number;              // percentagem (ex: 0.5 para 50%)
  }>;
}

interface IMTJovemResult {
  eligible: boolean;
  exemptionTotal: number;
  imtPayable: number;
  stampDuty: number;
  totalTax: number;
  effectiveRate: number;
  breakdown: string[];
}

// Escalões IMT 2025/2026 (simplificados — foco na lógica jovem)
const IMT_ESCALAO_4 = 330_539;
const IMT_ESCALAO_5 = 660_982;
const IMT_DEDUCAO_ESCALAO_5 = 26_443.12;
const IMT_TAXA_ESCALAO_5 = 0.08;
const STAMP_DUTY_RATE = 0.008; // 0,8%

export function calculateIMTJovem(input: IMTJovemInput): IMTJovemResult {
  const { propertyValue, buyerAge, isFirstHome, isResident, coBuyers } = input;
  const breakdown: string[] = [];

  // Requisitos base
  const baseEligible = buyerAge <= 35 && isFirstHome && isResident;
  breakdown.push(`Comprador principal: ${buyerAge} anos, ${isFirstHome ? 'primeira habitação' : 'não é primeira habitação'}`);

  if (!baseEligible) {
    // Cálculo normal IMT (simplificado para fora do âmbito jovem)
    const imt = propertyValue <= IMT_ESCALAO_4
      ? 0
      : propertyValue <= IMT_ESCALAO_5
        ? propertyValue * IMT_TAXA_ESCALAO_5 - IMT_DEDUCAO_ESCALAO_5
        : propertyValue * 0.065; // taxa média simplificada para acima
    const stamp = propertyValue * STAMP_DUTY_RATE;
    return {
      eligible: false,
      exemptionTotal: 0,
      imtPayable: Math.max(0, imt),
      stampDuty: stamp,
      totalTax: Math.max(0, imt) + stamp,
      effectiveRate: (Math.max(0, imt) + stamp) / propertyValue,
      breakdown: [...breakdown, 'Não elegível para IMT Jovem. Aplicado regime geral.'],
    };
  }

  // Se compra individual
  if (coBuyers.length === 0) {
    if (propertyValue <= IMT_ESCALAO_4) {
      breakdown.push(`Valor ≤ ${IMT_ESCALAO_4.toLocaleString('pt-PT')}€ → Isenção total de IMT`);
      const stamp = propertyValue * STAMP_DUTY_RATE;
      breakdown.push(`Imposto do Selo: ${stamp.toLocaleString('pt-PT', { maximumFractionDigits: 2 })}€`);
      return {
        eligible: true,
        exemptionTotal: propertyValue * IMT_TAXA_ESCALAO_5, // valor abstrato da isenção
        imtPayable: 0,
        stampDuty: 0, // Isento também de selo segundo decreto
        totalTax: 0,
        effectiveRate: 0,
        breakdown: [...breakdown, 'Isenção total de IMT e Imposto do Selo.'],
      };
    }

    if (propertyValue <= IMT_ESCALAO_5) {
      const exemptAmount = IMT_ESCALAO_4;
      const taxableAmount = propertyValue - exemptAmount;
      const imt = taxableAmount * IMT_TAXA_ESCALAO_5 - IMT_DEDUCAO_ESCALAO_5;
      breakdown.push(`Isenção parcial: ${exemptAmount.toLocaleString('pt-PT')}€ isentos`);
      breakdown.push(`Montante tributável: ${taxableAmount.toLocaleString('pt-PT')}€ × 8% − ${IMT_DEDUCAO_ESCALAO_5.toLocaleString('pt-PT')}€`);
      return {
        eligible: true,
        exemptionTotal: exemptAmount * IMT_TAXA_ESCALAO_5,
        imtPayable: Math.max(0, imt),
        stampDuty: 0,
        totalTax: Math.max(0, imt),
        effectiveRate: Math.max(0, imt) / propertyValue,
        breakdown: [...breakdown, 'Imposto do Selo isento.'],
      };
    }

    // Acima de 660.982€ — isenção apenas até ao 4.º escalão
    const imt = (propertyValue - IMT_ESCALAO_4) * IMT_TAXA_ESCALAO_5 - IMT_DEDUCAO_ESCALAO_5;
    breakdown.push(`Valor acima do limite de isenção parcial. Isentos apenas os primeiros ${IMT_ESCALAO_4.toLocaleString('pt-PT')}€`);
    return {
      eligible: true,
      exemptionTotal: IMT_ESCALAO_4 * IMT_TAXA_ESCALAO_5,
      imtPayable: Math.max(0, imt),
      stampDuty: propertyValue * STAMP_DUTY_RATE,
      totalTax: Math.max(0, imt) + propertyValue * STAMP_DUTY_RATE,
      effectiveRate: (Math.max(0, imt) + propertyValue * STAMP_DUTY_RATE) / propertyValue,
      breakdown: [...breakdown, 'Imposto do Selo aplicado sobre o valor total.'],
    };
  }

  /* ─── Compropriedade ─── */
  breakdown.push('Compra em compropriedade detectada');

  const allBuyers = [{ age: buyerAge, isFirstHome, share: 1 - coBuyers.reduce((s, c) => s + c.share, 0) }, ...coBuyers];
  const eligibleBuyers = allBuyers.filter((b) => b.age <= 35 && b.isFirstHome);
  const nonEligibleBuyers = allBuyers.filter((b) => !(b.age <= 35 && b.isFirstHome));

  const eligibleShare = eligibleBuyers.reduce((s, b) => s + b.share, 0);
  const nonEligibleShare = nonEligibleBuyers.reduce((s, b) => s + b.share, 0);

  breakdown.push(`Quota elegível (≤35 anos, 1ª habitação): ${(eligibleShare * 100).toFixed(0)}%`);
  breakdown.push(`Quota não elegível: ${(nonEligibleShare * 100).toFixed(0)}%`);

  const eligibleValue = propertyValue * eligibleShare;
  const nonEligibleValue = propertyValue * nonEligibleShare;

  // Parte elegível
  let imtEligible = 0;
  if (eligibleValue <= IMT_ESCALAO_4 * eligibleShare) {
    imtEligible = 0;
    breakdown.push(`Parte elegível (${(eligibleShare * 100).toFixed(0)}%) isenta`);
  } else if (eligibleValue <= IMT_ESCALAO_5 * eligibleShare) {
    const taxable = eligibleValue - IMT_ESCALAO_4 * eligibleShare;
    imtEligible = taxable * IMT_TAXA_ESCALAO_5 - IMT_DEDUCAO_ESCALAO_5 * eligibleShare;
    breakdown.push(`Parte elegível: isenção parcial`);
  } else {
    const taxable = eligibleValue - IMT_ESCALAO_4 * eligibleShare;
    imtEligible = taxable * IMT_TAXA_ESCALAO_5 - IMT_DEDUCAO_ESCALAO_5 * eligibleShare;
    breakdown.push(`Parte elegível: isenção limitada ao 4.º escalão`);
  }

  // Parte não elegível — taxas normais IMT (simplificado)
  let imtNonEligible = 0;
  if (nonEligibleValue > 0) {
    if (nonEligibleValue <= IMT_ESCALAO_4) {
      imtNonEligible = 0;
    } else if (nonEligibleValue <= IMT_ESCALAO_5) {
      imtNonEligible = nonEligibleValue * IMT_TAXA_ESCALAO_5 - IMT_DEDUCAO_ESCALAO_5;
    } else {
      imtNonEligible = nonEligibleValue * 0.065;
    }
    breakdown.push(`Parte não elegível tributada em regime geral`);
  }

  const totalIMT = Math.max(0, imtEligible + imtNonEligible);
  const stamp = propertyValue * STAMP_DUTY_RATE; // selo sobre valor total (simplificado)

  return {
    eligible: true,
    exemptionTotal: eligibleValue * IMT_TAXA_ESCALAO_5,
    imtPayable: totalIMT,
    stampDuty: stamp,
    totalTax: totalIMT + stamp,
    effectiveRate: (totalIMT + stamp) / propertyValue,
    breakdown,
  };
}

/* ─── ANGOLA: IPU / Sisa ─── */

interface IPUAngolaInput {
  propertyValue: number;        // em Kwanzas
  propertyType: 'occupied' | 'vacant'; // ocupado vs desocupado
  location: 'mainland' | 'cabinda';
  isExemptSisa?: boolean;       // até 40M Kz isento de Sisa
}

interface IPUAngolaResult {
  sisaPayable: number;
  ipuPayable: number;
  totalTax: number;
  effectiveRate: number;
  breakdown: string[];
}

const SISA_EXEMPTION_LIMIT = 40_000_000;
const SISA_RATE_MAINLAND = 0.01;
const SISA_RATE_CABINDA = 0.005;
const IPU_EXEMPTION = 5_000_000;
const IPU_RATE_VACANT = 0.005;

export function calculateIPUAngola(input: IPUAngolaInput): IPUAngolaResult {
  const { propertyValue, propertyType, location, isExemptSisa } = input;
  const breakdown: string[] = [];

  // Sisa (transação)
  let sisa = 0;
  if (isExemptSisa || propertyValue <= SISA_EXEMPTION_LIMIT) {
    breakdown.push(`Sisa: Isento (valor ≤ ${SISA_EXEMPTION_LIMIT.toLocaleString('pt-AO')} Kz)`);
  } else {
    const rate = location === 'cabinda' ? SISA_RATE_CABINDA : SISA_RATE_MAINLAND;
    sisa = propertyValue * rate;
    breakdown.push(`Sisa (${location === 'cabinda' ? '0,5%' : '1%'}): ${sisa.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz`);
  }

  // IPU (Imposto Predial Urbano)
  let ipu = 0;
  if (propertyType === 'vacant') {
    const taxableBase = Math.max(0, propertyValue - IPU_EXEMPTION);
    ipu = taxableBase * IPU_RATE_VACANT;
    breakdown.push(`IPU (desocupado): (${propertyValue.toLocaleString('pt-AO')} − ${IPU_EXEMPTION.toLocaleString('pt-AO')}) × 0,5% = ${ipu.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz`);
  } else {
    breakdown.push('IPU: Propriedade ocupada — taxa variável conforme uso (simulado como zero para ocupação principal)');
  }

  const total = sisa + ipu;
  return {
    sisaPayable: sisa,
    ipuPayable: ipu,
    totalTax: total,
    effectiveRate: total / propertyValue,
    breakdown,
  };
}
