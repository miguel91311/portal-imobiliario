import { prisma } from './index';

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.activityLog.deleteMany();
  await prisma.valuation.deleteMany();
  await prisma.document.deleteMany();
  await prisma.simulation.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@portalpremium.pt',
      passwordHash: '$2a$10$hashed_password_placeholder',
      name: 'Dra. Inês Ribeiro',
      role: 'admin',
      country: 'PT',
      kycStatus: 'approved',
      kycRisk: 'low',
    },
  });

  const agent1 = await prisma.user.create({
    data: {
      email: 'carlos@olcapital.ao',
      passwordHash: '$2a$10$hashed_password_placeholder',
      name: 'Carlos Mendes',
      role: 'agent',
      country: 'AO',
      agency: 'OLCapital Premium',
      licenseId: 'APIMA-2847',
      kycStatus: 'approved',
      kycRisk: 'low',
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      email: 'sofia@private.pt',
      passwordHash: '$2a$10$hashed_password_placeholder',
      name: 'Sofia Ribeiro',
      role: 'agent',
      country: 'PT',
      agency: 'Private Selection Portugal',
      licenseId: 'IMPIC-9921',
      kycStatus: 'approved',
      kycRisk: 'low',
    },
  });

  const owner1 = await prisma.user.create({
    data: {
      email: 'ricardo.silva@email.pt',
      passwordHash: '$2a$10$hashed_password_placeholder',
      name: 'Dr. Ricardo Silva',
      role: 'owner',
      country: 'PT',
      kycStatus: 'approved',
      kycRisk: 'low',
    },
  });

  // Properties
  const prop1 = await prisma.property.create({
    data: {
      title: 'Moradia de Luxo em Talatona',
      description: 'Propriedade de referência na Península do Porto. Arquitetura contemporânea com materiais nobres, jardim tropical privado e acesso direto ao campo de golfe.',
      price: 2850000000,
      currency: 'AOA',
      address: 'Rua da Península, Lote 45',
      city: 'Luanda',
      country: 'AO',
      neighborhood: 'Talatona',
      latitude: -8.9167,
      longitude: 13.1833,
      typology: 'T5',
      bedrooms: 5,
      bathrooms: 6,
      sqm: 420,
      parking: 3,
      pool: true,
      garden: true,
      energyCertificate: 'A',
      walkScore: 62,
      status: 'available',
      listingType: 'sale',
      tags: JSON.stringify(['Nova Construção', 'Península do Porto', 'Piscina']),
      images: JSON.stringify([
        { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', alt: 'Fachada principal', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80', alt: 'Sala de estar' },
      ]),
      agentId: agent1.id,
      viewCount: 342,
      contactCount: 18,
    },
  });

  const prop2 = await prisma.property.create({
    data: {
      title: 'Apartamento Panorâmico na Ilha do Cabo',
      description: 'Vistas deslumbrantes sobre a baía de Luanda. Acabamentos de luxo, cozinha equipada Gaggenau, varanda suspensa de 40m².',
      price: 1850000000,
      currency: 'AOA',
      address: 'Avenida Murtala Mohammed, Edifício Miramar Tower',
      city: 'Luanda',
      country: 'AO',
      neighborhood: 'Ilha do Cabo',
      latitude: -8.8167,
      longitude: 13.2333,
      typology: 'T4',
      bedrooms: 4,
      bathrooms: 4,
      sqm: 280,
      parking: 2,
      pool: true,
      garden: false,
      energyCertificate: 'A',
      walkScore: 78,
      status: 'available',
      listingType: 'sale',
      tags: JSON.stringify(['Vista Mar', 'Segurança 24h', 'Luxo']),
      images: JSON.stringify([
        { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', alt: 'Vista da varanda', isPrimary: true },
      ]),
      agentId: agent1.id,
      viewCount: 512,
      contactCount: 24,
    },
  });

  const prop3 = await prisma.property.create({
    data: {
      title: 'Palacete Renovado em Cascais',
      description: 'Exemplar único de arquitetura manuelina revitalizada. Pátio interior com jardim zen, piscina aquecida e adega climatizada.',
      price: 450000000,
      currency: 'EUR',
      address: 'Rua do Visconde da Luz, 120',
      city: 'Cascais',
      country: 'PT',
      neighborhood: 'Centro Histórico',
      latitude: 38.697,
      longitude: -9.422,
      typology: 'T6',
      bedrooms: 6,
      bathrooms: 7,
      sqm: 580,
      parking: 4,
      pool: true,
      garden: true,
      energyCertificate: 'A+',
      walkScore: 91,
      status: 'available',
      listingType: 'sale',
      tags: JSON.stringify(['Património', 'A+', 'Marina']),
      images: JSON.stringify([
        { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80', alt: 'Fachada histórica', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', alt: 'Jardim interior' },
      ]),
      agentId: agent2.id,
      viewCount: 189,
      contactCount: 12,
    },
  });

  const prop4 = await prisma.property.create({
    data: {
      title: 'Penthouse com Rooftop em Lisboa',
      description: 'Duplex no topo do edifício ICON. Rooftop privado de 120m², jacuzzi exterior, cozinha de verão. Vista 360° sobre o Tejo.',
      price: 320000000,
      currency: 'EUR',
      address: 'Avenida da Liberdade, 245, Piso 15',
      city: 'Lisboa',
      country: 'PT',
      neighborhood: 'Avenidas Novas',
      latitude: 38.7223,
      longitude: -9.1453,
      typology: 'T4',
      bedrooms: 4,
      bathrooms: 5,
      sqm: 350,
      parking: 2,
      pool: false,
      garden: false,
      energyCertificate: 'A',
      walkScore: 96,
      status: 'available',
      listingType: 'sale',
      tags: JSON.stringify(['Rooftop', 'Vista Tejo', 'Duplex']),
      images: JSON.stringify([
        { url: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80', alt: 'Rooftop privado', isPrimary: true },
      ]),
      agentId: agent2.id,
      viewCount: 421,
      contactCount: 15,
    },
  });

  // Leads
  await prisma.lead.create({
    data: {
      name: 'Dr. Ricardo Silva',
      email: 'r.silva@familyoffice.pt',
      score: 94,
      status: 'hot',
      source: 'organic',
      propertyId: prop3.id,
      agentId: agent2.id,
    },
  });

  await prisma.lead.create({
    data: {
      name: 'Ana Luísa Mendes',
      email: 'ana.m@luanda.co.ao',
      score: 87,
      status: 'hot',
      source: 'paid',
      propertyId: prop1.id,
      agentId: agent1.id,
    },
  });

  await prisma.lead.create({
    data: {
      name: 'Carlos Tavares',
      email: 'ctavares@gmail.com',
      score: 62,
      status: 'warm',
      source: 'organic',
      propertyId: prop4.id,
      agentId: agent2.id,
    },
  });

  // Documents
  await prisma.document.create({
    data: {
      name: 'Caderneta Predial',
      type: 'PDF',
      url: '/docs/caderneta_prop3.pdf',
      size: 2400000,
      status: 'verified',
      propertyId: prop3.id,
      ownerId: owner1.id,
    },
  });

  await prisma.document.create({
    data: {
      name: 'Certificado Energético',
      type: 'PDF',
      url: '/docs/ce_prop3.pdf',
      size: 1100000,
      status: 'verified',
      propertyId: prop3.id,
      ownerId: owner1.id,
    },
  });

  await prisma.document.create({
    data: {
      name: 'Licença de Utilização',
      type: 'PDF',
      url: '/docs/licenca_prop3.pdf',
      size: 850000,
      status: 'pending',
      propertyId: prop3.id,
      ownerId: owner1.id,
    },
  });

  // Featured Packages
  await prisma.featuredPackage.deleteMany();
  await prisma.featuredPackage.createMany({
    data: [
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
        description: 'Plano trimestral completo com notificações push e relatórios.',
        price: 9990,
        durationDays: 90,
        features: JSON.stringify(['Destaque na lista', 'Pin dourado no mapa', 'Banner homepage', 'Relatório semanal']),
        isActive: true,
      },
    ],
  });

  // Activity Logs
  await prisma.activityLog.create({
    data: {
      action: 'Aprovação KYC',
      target: 'OLCapital Premium',
      userId: admin.id,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: 'Scan anti-deepfake',
      target: 'Anúncio #8842',
    },
  });

  console.log('✅ Seed completed successfully');
  console.log(`   Users: ${await prisma.user.count()}`);
  console.log(`   Properties: ${await prisma.property.count()}`);
  console.log(`   Leads: ${await prisma.lead.count()}`);
  console.log(`   Documents: ${await prisma.document.count()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
