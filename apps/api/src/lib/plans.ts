export const AGENT_PLANS = {
  free: { name: 'Gratuito', price: 0, listingLimit: 0, label: '0 anúncios' },
  starter: { name: 'Starter', price: 20, listingLimit: 5, label: 'Até 5 anúncios' },
  pro: { name: 'Pro', price: 35, listingLimit: 10, label: 'Até 10 anúncios' },
  enterprise: { name: 'Enterprise', price: 60, listingLimit: 30, label: 'Até 30 anúncios' },
} as const;

export type PlanType = keyof typeof AGENT_PLANS;

export function getPlanLimits(planType: string) {
  return AGENT_PLANS[planType as PlanType] || AGENT_PLANS.free;
}

export function canCreateListing(
  role: string,
  planType: string,
  listingCount: number,
  freeListingsUsed: number
): { allowed: boolean; reason?: string } {
  if (role === 'owner') {
    if (freeListingsUsed >= 3 && listingCount >= 3) {
      return { allowed: false, reason: 'Limite de 3 anúncios gratuitos atingido. Compre um pacote de destaque para continuar.' };
    }
    return { allowed: true };
  }

  if (role === 'agent' || role === 'admin') {
    const limits = getPlanLimits(planType);
    if (listingCount >= limits.listingLimit) {
      return { allowed: false, reason: `Limite de ${limits.listingLimit} anúncios do plano ${limits.name} atingido. Faça upgrade para publicar mais.` };
    }
    return { allowed: true };
  }

  return { allowed: false, reason: 'Tipo de utilizador não autorizado a criar anúncios.' };
}
