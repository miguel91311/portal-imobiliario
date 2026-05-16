import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const properties = await prisma.property.findMany({ take: 3 });
  if (properties.length === 0) {
    console.log('No properties found, skipping valuation seed.');
    return;
  }

  for (const property of properties) {
    const existing = await prisma.valuation.count({ where: { propertyId: property.id } });
    if (existing > 0) continue;

    const basePrice = property.country === 'PT' ? 3500 : 4500;
    const estimatedValue = Math.round(property.sqm * basePrice * (0.9 + Math.random() * 0.2));

    await prisma.valuation.create({
      data: {
        propertyId: property.id,
        estimatedValue,
        confidence: Math.floor(Math.random() * 10) + 88,
        currency: property.country === 'PT' ? 'EUR' : 'AOA',
        factors: JSON.stringify({
          basePerSqm: basePrice,
          walkScorePremium: Math.random() > 0.5 ? 0.08 : 0,
          energyPremium: Math.random() > 0.5 ? 0.12 : 0,
          locationPremium: Math.random() > 0.5 ? 0.15 : 0,
        }),
      },
    });

    // Create a second older valuation
    await prisma.valuation.create({
      data: {
        propertyId: property.id,
        estimatedValue: Math.round(estimatedValue * 0.95),
        confidence: Math.floor(Math.random() * 10) + 88,
        currency: property.country === 'PT' ? 'EUR' : 'AOA',
        factors: JSON.stringify({ basePerSqm: basePrice * 0.95 }),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log('Valuations seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
