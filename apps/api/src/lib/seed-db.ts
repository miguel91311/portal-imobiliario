import bcryptjs from 'bcryptjs';
import { prisma } from './db';
import { seedProperties, seedAggregatedListings } from './seed-data';

const DEMO_PASSWORD = bcryptjs.hashSync('password123', 10);

export async function seedDatabase() {
  console.log('🌱 Seeding database...');

  const existingUsers = await prisma.user.count();
  if (existingUsers >= 5) {
    console.log(`   ℹ️ Database already has ${existingUsers} users, skipping seed.`);
    return;
  }

  // Seed demo users
  const users = [
    { email: 'admin@portalpremium.pt', name: 'Admin Portal', role: 'admin', country: 'PT', agency: 'Portal Premium' },
    { email: 'carlos@olcapital.ao', name: 'Carlos Mendes', role: 'agent', country: 'AO', agency: 'OLCapital Premium' },
    { email: 'ricardo.silva@email.pt', name: 'Ricardo Silva', role: 'buyer', country: 'PT' },
    { email: 'ana.ferreira@email.pt', name: 'Ana Ferreira', role: 'agent', country: 'PT', agency: 'Imobiliária Casa dos Sonhos' },
    { email: 'sofia.ribeiro@email.pt', name: 'Sofia Ribeiro', role: 'agent', country: 'PT', agency: 'Private Selection Portugal' },
    { email: 'miguel.torres@email.pt', name: 'Miguel Torres', role: 'agent', country: 'PT', agency: 'Sotheby\'s Portugal' },
    { email: 'ines.costa@email.pt', name: 'Inês Costa', role: 'agent', country: 'PT', agency: 'Remax Premium Porto' },
    { email: 'pedro.lopes@email.pt', name: 'Pedro Lopes', role: 'agent', country: 'AO', agency: 'GM Imobiliária' },
    { email: 'maria.proprietaria@email.pt', name: 'Maria Proprietária', role: 'owner', country: 'PT' },
    { email: 'joao.comprador@email.pt', name: 'João Comprador', role: 'buyer', country: 'PT' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        ...u,
        passwordHash: DEMO_PASSWORD,
        isActive: true,
        kycStatus: 'verified',
        planType: u.role === 'agent' ? 'pro' : 'free',
      },
    });
  }
  console.log(`   ✅ Seeded ${users.length} demo users`);

  // Get agent IDs to assign properties
  const agents = await prisma.user.findMany({
    where: { role: { in: ['agent', 'admin'] } },
  });

  // Seed properties
  for (let i = 0; i < seedProperties.length; i++) {
    const prop = seedProperties[i];
    const agent = agents[i % agents.length];
    await prisma.property.create({
      data: {
        ...prop,
        status: 'available',
        viewCount: Math.floor(Math.random() * 200),
        contactCount: Math.floor(Math.random() * 20),
        agentId: agent?.id || null,
      },
    });
  }
  console.log(`   ✅ Seeded ${seedProperties.length} properties`);

  // Seed aggregated listings
  const aggCount = await prisma.aggregatedListing.count();
  if (aggCount === 0) {
    for (const listing of seedAggregatedListings) {
      await prisma.aggregatedListing.create({ data: listing });
    }
    console.log(`   ✅ Seeded ${seedAggregatedListings.length} aggregated listings`);
  }

  // Seed some price history for a few PT properties
  const ptProps = await prisma.property.findMany({
    where: { country: 'PT' },
    take: 4,
  });

  for (const prop of ptProps) {
    const originalPrice = Number(prop.price);
    const price1 = Math.round(originalPrice * 1.05);
    const price2 = Math.round(originalPrice * 0.97);

    await prisma.priceHistory.create({
      data: {
        propertyId: prop.id,
        oldPrice: price1,
        newPrice: originalPrice,
        reason: 'market_adjustment',
      },
    });

    await prisma.priceHistory.create({
      data: {
        propertyId: prop.id,
        oldPrice: price2,
        newPrice: price1,
        reason: 'owner_request',
      },
    });
  }
  console.log(`   ✅ Seeded price history for ${ptProps.length} properties`);

  // Seed agent reviews
  const agentUsers = await prisma.user.findMany({
    where: { role: { in: ['agent', 'admin'] } },
    take: 3,
  });

  const buyers = await prisma.user.findMany({
    where: { role: 'buyer' },
    take: 3,
  });

  for (const agent of agentUsers) {
    for (let i = 0; i < 2; i++) {
      const author = buyers[i] || buyers[0];
      if (author && author.id !== agent.id) {
        await prisma.agentReview.create({
          data: {
            agentId: agent.id,
            authorId: author.id,
            rating: [4, 5, 5, 3, 5][Math.floor(Math.random() * 5)],
            title: ['Excelente atendimento', 'Muito profissional', 'Recomendo', 'Rápido e eficiente'][Math.floor(Math.random() * 4)],
            comment: 'Agente muito atencioso e conhecedor do mercado. Respondeu a todas as dúvidas e agendou visitas rapidamente.',
            verified: Math.random() > 0.3,
          },
        });
      }
    }
  }
  console.log(`   ✅ Seeded agent reviews`);

  console.log('🌱 Seed complete!');
}
