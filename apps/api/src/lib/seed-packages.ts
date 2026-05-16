import { prisma } from './db';

const DEFAULT_PACKAGES = [
  {
    name: 'Sprint',
    description: 'Destaque rápido por 1 semana — ideal para impulsionar visibilidade imediata.',
    price: 200,
    durationDays: 7,
    features: JSON.stringify(['Destaque na lista de resultados', 'Pin dourado no mapa']),
    isActive: true,
  },
  {
    name: 'Básico',
    description: 'Pacote de destaque essencial para maior visibilidade.',
    price: 1990,
    durationDays: 7,
    features: JSON.stringify(['Destaque na lista de resultados', 'Pin dourado no mapa']),
    isActive: true,
  },
  {
    name: 'Premium',
    description: 'Máxima exposição durante 30 dias com banner na homepage.',
    price: 4990,
    durationDays: 30,
    features: JSON.stringify(['Destaque na lista', 'Pin dourado no mapa', 'Banner na homepage']),
    isActive: true,
  },
  {
    name: 'Pro',
    description: 'Plano trimestral completo com relatórios.',
    price: 9990,
    durationDays: 90,
    features: JSON.stringify(['Destaque na lista', 'Pin dourado no mapa', 'Banner homepage', 'Relatório semanal']),
    isActive: true,
  },
];

export async function ensureFeaturedPackages() {
  try {
    const existing = await prisma.featuredPackage.findMany({ where: { isActive: true } });
    const existingNames = new Set(existing.map((p) => p.name));

    for (const pkg of DEFAULT_PACKAGES) {
      if (!existingNames.has(pkg.name)) {
        await prisma.featuredPackage.create({ data: pkg });
        console.log(`📦 Pacote de destaque "${pkg.name}" criado`);
      }
    }
  } catch (err) {
    console.error('Erro ao garantir pacotes de destaque:', err);
  }
}
