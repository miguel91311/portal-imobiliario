import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.featuredPackage.count();
  if (existing > 0) {
    console.log('Featured packages already exist, skipping seed.');
    return;
  }

  await prisma.featuredPackage.createMany({
    data: [
      {
        name: 'Destaque Básico',
        description: 'Destaque nas pesquisas por 7 dias',
        price: 1990, // €19.90 in cents
        durationDays: 7,
        features: JSON.stringify(['Destaque nas pesquisas', 'Badge de destaque', 'Posição prioritária']),
      },
      {
        name: 'Destaque Premium',
        description: 'Máxima visibilidade por 30 dias',
        price: 4990, // €49.90 in cents
        durationDays: 30,
        features: JSON.stringify(['Topo das pesquisas', 'Badge premium dourado', 'Posição prioritária', 'Notificação push', 'Social media highlight']),
      },
      {
        name: 'Destaque Pro',
        description: 'Visibilidade total por 90 dias',
        price: 9990, // €99.90 in cents
        durationDays: 90,
        features: JSON.stringify(['Topo absoluto', 'Badge pro', 'Posição prioritária', 'Notificação push', 'Social media highlight', 'Email campaign', 'Homepage featured']),
      },
    ],
  });

  console.log('Featured packages seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
