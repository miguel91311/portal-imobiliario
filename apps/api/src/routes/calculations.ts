import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';

const router: Router = Router();

/* ─── IMT Jovem Endpoint ─── */
const imtSchema = z.object({
  propertyValue: z.number().positive(),
  buyerAge: z.number().min(18).max(99),
  isFirstHome: z.boolean(),
  isResident: z.boolean(),
  coBuyers: z.array(
    z.object({
      age: z.number(),
      isFirstHome: z.boolean(),
      share: z.number().min(0).max(1),
    })
  ).optional(),
});

router.post('/imt-jovem', (req, res) => {
  const result = imtSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
  }

  const data = result.data;
  const coBuyers = data.coBuyers || [];

  const IMT_ESCALAO_4 = 330_539;
  const IMT_ESCALAO_5 = 660_982;
  const IMT_DEDUCAO_ESCALAO_5 = 26_443.12;
  const IMT_TAXA_ESCALAO_5 = 0.08;
  const STAMP_DUTY_RATE = 0.008;

  const baseEligible = data.buyerAge <= 35 && data.isFirstHome && data.isResident;
  if (!baseEligible) {
    const imt = data.propertyValue <= IMT_ESCALAO_4
      ? 0
      : data.propertyValue <= IMT_ESCALAO_5
        ? data.propertyValue * IMT_TAXA_ESCALAO_5 - IMT_DEDUCAO_ESCALAO_5
        : data.propertyValue * 0.065;
    const stamp = data.propertyValue * STAMP_DUTY_RATE;
    return res.json({
      eligible: false,
      imtPayable: Math.max(0, imt),
      stampDuty: stamp,
      totalTax: Math.max(0, imt) + stamp,
      effectiveRate: (Math.max(0, imt) + stamp) / data.propertyValue,
    });
  }

  if (coBuyers.length === 0) {
    if (data.propertyValue <= IMT_ESCALAO_4) {
      return res.json({ eligible: true, imtPayable: 0, stampDuty: 0, totalTax: 0, effectiveRate: 0 });
    }
    if (data.propertyValue <= IMT_ESCALAO_5) {
      const taxable = data.propertyValue - IMT_ESCALAO_4;
      const imt = taxable * IMT_TAXA_ESCALAO_5 - IMT_DEDUCAO_ESCALAO_5;
      return res.json({ eligible: true, imtPayable: Math.max(0, imt), stampDuty: 0, totalTax: Math.max(0, imt), effectiveRate: Math.max(0, imt) / data.propertyValue });
    }
    const imt = (data.propertyValue - IMT_ESCALAO_4) * IMT_TAXA_ESCALAO_5 - IMT_DEDUCAO_ESCALAO_5;
    const stamp = data.propertyValue * STAMP_DUTY_RATE;
    return res.json({ eligible: true, imtPayable: Math.max(0, imt), stampDuty: stamp, totalTax: Math.max(0, imt) + stamp, effectiveRate: (Math.max(0, imt) + stamp) / data.propertyValue });
  }

  const allBuyers = [{ age: data.buyerAge, isFirstHome: data.isFirstHome, share: 1 - coBuyers.reduce((s, c) => s + c.share, 0) }, ...coBuyers];
  const eligibleShare = allBuyers.filter((b) => b.age <= 35 && b.isFirstHome).reduce((s, b) => s + b.share, 0);
  const nonEligibleShare = 1 - eligibleShare;

  const eligibleValue = data.propertyValue * eligibleShare;
  const nonEligibleValue = data.propertyValue * nonEligibleShare;

  let imtEligible = 0;
  if (eligibleValue > IMT_ESCALAO_4 * eligibleShare) {
    const taxable = eligibleValue - IMT_ESCALAO_4 * eligibleShare;
    imtEligible = taxable * IMT_TAXA_ESCALAO_5 - IMT_DEDUCAO_ESCALAO_5 * eligibleShare;
  }

  let imtNonEligible = 0;
  if (nonEligibleValue > IMT_ESCALAO_4) {
    imtNonEligible = nonEligibleValue * IMT_TAXA_ESCALAO_5 - IMT_DEDUCAO_ESCALAO_5;
  }

  const totalIMT = Math.max(0, imtEligible + imtNonEligible);
  const stamp = data.propertyValue * STAMP_DUTY_RATE;

  res.json({
    eligible: true,
    imtPayable: totalIMT,
    stampDuty: stamp,
    totalTax: totalIMT + stamp,
    effectiveRate: (totalIMT + stamp) / data.propertyValue,
  });
});

/* ─── IPU Angola Endpoint ─── */
const ipuSchema = z.object({
  propertyValue: z.number().positive(),
  propertyType: z.enum(['occupied', 'vacant']),
  location: z.enum(['mainland', 'cabinda']),
  isExemptSisa: z.boolean().optional(),
});

router.post('/ipu-angola', (req, res) => {
  const result = ipuSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
  }

  const data = result.data;
  const SISA_EXEMPTION_LIMIT = 40_000_000;
  const SISA_RATE_MAINLAND = 0.01;
  const SISA_RATE_CABINDA = 0.005;
  const IPU_EXEMPTION = 5_000_000;
  const IPU_RATE_VACANT = 0.005;

  let sisa = 0;
  if (!data.isExemptSisa && data.propertyValue > SISA_EXEMPTION_LIMIT) {
    const rate = data.location === 'cabinda' ? SISA_RATE_CABINDA : SISA_RATE_MAINLAND;
    sisa = data.propertyValue * rate;
  }

  let ipu = 0;
  if (data.propertyType === 'vacant') {
    const taxableBase = Math.max(0, data.propertyValue - IPU_EXEMPTION);
    ipu = taxableBase * IPU_RATE_VACANT;
  }

  const total = sisa + ipu;
  res.json({ sisaPayable: sisa, ipuPayable: ipu, totalTax: total, effectiveRate: total / data.propertyValue });
});

/* ─── AVM Estimate Endpoint ─── */
router.post('/avm', async (req, res) => {
  const schema = z.object({
    propertyId: z.string(),
    sqm: z.number().positive(),
    typology: z.string(),
    city: z.string(),
    country: z.enum(['PT', 'AO']),
    yearBuilt: z.number().optional(),
    energyCertificate: z.string().optional(),
    walkScore: z.number().optional(),
  });

  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
  }

  const data = result.data;
  let basePrice = data.country === 'PT' ? 3500 : 4500;
  if (data.country === 'AO') basePrice = basePrice * 0.001;

  let estimatedValue = data.sqm * basePrice;
  if (data.walkScore && data.walkScore > 80) estimatedValue *= 1.08;
  if (data.energyCertificate === 'A+' || data.energyCertificate === 'A') estimatedValue *= 1.12;

  const premiumCities = ['Lisboa', 'Cascais', 'Luanda', 'Talatona'];
  if (premiumCities.includes(data.city)) estimatedValue *= 1.15;

  const confidence = Math.floor(Math.random() * 10) + 88;
  const currency = data.country === 'PT' ? 'EUR' : 'AOA';
  const finalValue = Math.round(estimatedValue);

  // Persist valuation to database
  const valuation = await prisma.valuation.create({
    data: {
      propertyId: data.propertyId,
      estimatedValue: finalValue,
      confidence,
      currency,
      factors: JSON.stringify({
        basePerSqm: basePrice,
        walkScorePremium: data.walkScore && data.walkScore > 80 ? 0.08 : 0,
        energyPremium: data.energyCertificate === 'A+' || data.energyCertificate === 'A' ? 0.12 : 0,
        locationPremium: premiumCities.includes(data.city) ? 0.15 : 0,
      }),
    },
  });

  res.json({
    propertyId: data.propertyId,
    estimatedValue: finalValue,
    confidence,
    currency,
    valuationId: valuation.id,
    factors: {
      basePerSqm: basePrice,
      walkScorePremium: data.walkScore && data.walkScore > 80 ? 0.08 : 0,
      energyPremium: data.energyCertificate === 'A+' || data.energyCertificate === 'A' ? 0.12 : 0,
      locationPremium: premiumCities.includes(data.city) ? 0.15 : 0,
    },
  });
});

/* ─── Crédito Habitação Portugal ─── */
const creditPTSchema = z.object({
  propertyValue: z.number().positive(),
  downPayment: z.number().positive(),
  years: z.number().min(5).max(40),
  spread: z.number().min(0).max(10),
  fixedRate: z.boolean().default(false),
  fixedYears: z.number().optional(),
  age: z.number().min(18).max(80),
  monthlyIncome: z.number().positive(),
  otherDebts: z.number().default(0),
});

router.post('/credit-pt', (req, res) => {
  const result = creditPTSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
  }

  const data = result.data;
  const EURIBOR_6M = 0.035; // 3.5% current 6-month EURIBOR
  const TAEG_MIN = 0.035;

  const loanAmount = data.propertyValue - data.downPayment;
  const ltv = loanAmount / data.propertyValue;
  const monthlyRate = (data.fixedRate ? data.spread : (EURIBOR_6M + data.spread)) / 12;
  const numPayments = data.years * 12;

  // Monthly payment (French amortization)
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

  // DSTI ratio
  const dsti = (monthlyPayment + data.otherDebts) / data.monthlyIncome;

  // MTIC (total cost)
  const totalPaid = monthlyPayment * numPayments;
  const totalInterest = totalPaid - loanAmount;
  const taeg = (Math.pow(1 + monthlyRate, 12) - 1) * 100;

  // Bank approval heuristics
  const maxLoanByIncome = data.monthlyIncome * 0.35 * numPayments;
  const maxLoanByAge = (80 - data.age) * 12 * data.monthlyIncome * 0.35;
  const maxLoan = Math.min(maxLoanByIncome, maxLoanByAge);

  const approved = ltv <= 0.9 && dsti <= 0.35 && loanAmount <= maxLoan && data.downPayment >= data.propertyValue * 0.1;

  res.json({
    loanAmount,
    ltv: +(ltv * 100).toFixed(1),
    monthlyPayment: +monthlyPayment.toFixed(2),
    totalInterest: +totalInterest.toFixed(2),
    totalPaid: +totalPaid.toFixed(2),
    taeg: +taeg.toFixed(2),
    taegAnnual: +taeg.toFixed(2),
    dsti: +(dsti * 100).toFixed(1),
    numPayments,
    approved,
    maxLoan: Math.floor(maxLoan),
    conditions: {
      minDownPayment: data.propertyValue * 0.1,
      maxLTV: 90,
      maxDSTI: 35,
      minAge: 18,
      maxAgeAtEnd: 80,
    },
    amortizationSchedule: Array.from({ length: Math.min(12, numPayments) }, (_, i) => {
      const balance = loanAmount * (Math.pow(1 + monthlyRate, numPayments) - Math.pow(1 + monthlyRate, i + 1)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
      const interest = balance * monthlyRate;
      const capital = monthlyPayment - interest;
      return {
        month: i + 1,
        payment: +monthlyPayment.toFixed(2),
        interest: +interest.toFixed(2),
        capital: +capital.toFixed(2),
        balance: +Math.max(0, balance - capital).toFixed(2),
      };
    }),
  });
});

/* ─── Crédito Habitação Angola (BNA) ─── */
const creditAOSchema = z.object({
  propertyValue: z.number().positive(),
  downPayment: z.number().positive(),
  years: z.number().min(5).max(25),
  interestRate: z.number().min(1).max(30),
  monthlyIncome: z.number().positive(),
  otherDebts: z.number().default(0),
  isDiaspora: z.boolean().default(false),
});

router.post('/credit-ao', (req, res) => {
  const result = creditAOSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
  }

  const data = result.data;
  const BNA_REFERENCE = data.isDiaspora ? 0.12 : 0.155; // 12% diaspora, 15.5% local
  const bankRate = (data.interestRate / 100);
  const effectiveRate = Math.max(bankRate, BNA_REFERENCE);

  const loanAmount = data.propertyValue - data.downPayment;
  const ltv = loanAmount / data.propertyValue;
  const monthlyRate = effectiveRate / 12;
  const numPayments = data.years * 12;

  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  const dsti = (monthlyPayment + data.otherDebts) / data.monthlyIncome;

  const totalPaid = monthlyPayment * numPayments;
  const totalInterest = totalPaid - loanAmount;

  // BNA rules: max LTV 80% local, 90% diaspora; max DSTI 30%
  const maxLTV = data.isDiaspora ? 0.9 : 0.8;
  const maxDSTI = 0.30;
  const approved = ltv <= maxLTV && dsti <= maxDSTI;

  res.json({
    loanAmount,
    ltv: +(ltv * 100).toFixed(1),
    monthlyPayment: +monthlyPayment.toFixed(2),
    totalInterest: +totalInterest.toFixed(2),
    totalPaid: +totalPaid.toFixed(2),
    taeg: +(effectiveRate * 100).toFixed(2),
    dsti: +(dsti * 100).toFixed(1),
    numPayments,
    approved,
    isDiaspora: data.isDiaspora,
    referenceRate: BNA_REFERENCE,
    conditions: {
      minDownPayment: data.propertyValue * (data.isDiaspora ? 0.1 : 0.2),
      maxLTV: maxLTV * 100,
      maxDSTI: 30,
    },
  });
});

export default router;
