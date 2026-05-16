import { Property } from '@/types/property';

export const mockProperties: Property[] = [
  {
    id: 'prop-001',
    title: 'Moradia de Luxo em Talatona',
    description: 'Propriedade de referência na Península do Porto. Arquitetura contemporânea com materiais nobres, jardim tropical privado e acesso direto ao campo de golfe. Isenção de IPU disponível para estrangeiros.',
    price: 2850000000, // 2.85B AOA ~ 3.2M EUR
    currency: 'AOA',
    location: {
      address: 'Rua da Península, Lote 45',
      city: 'Luanda',
      country: 'AO',
      neighborhood: 'Talatona',
      coordinates: { latitude: -8.9167, longitude: 13.1833 },
    },
    typology: 'T5',
    features: { bedrooms: 5, bathrooms: 6, sqm: 420, parking: 3, pool: true, garden: true, energyCertificate: 'A', walkScore: 62 },
    images: [
      { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', alt: 'Fachada principal', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80', alt: 'Sala de estar' },
    ],
    status: 'available',
    listingType: 'sale',
    agent: { name: 'Carlos Mendes', agency: 'OLCapital Premium' },
    tags: ['Nova Construção', 'Península do Porto', 'Piscina'],
    createdAt: '2026-04-15T10:00:00Z',
    updatedAt: '2026-05-08T14:30:00Z',
  },
  {
    id: 'prop-002',
    title: 'Apartamento Panorâmico na Ilha do Cabo',
    description: 'Vistas deslumbrantes sobre a baía de Luanda. Acabamentos de luxo, cozinha equipada Gaggenau, varanda suspensa de 40m². Segurança 24h e sistema de estacionamento subterrâneo.',
    price: 1850000000,
    currency: 'AOA',
    location: {
      address: 'Avenida Murtala Mohammed, Edifício Miramar Tower',
      city: 'Luanda',
      country: 'AO',
      neighborhood: 'Ilha do Cabo',
      coordinates: { latitude: -8.8167, longitude: 13.2333 },
    },
    typology: 'T4',
    features: { bedrooms: 4, bathrooms: 4, sqm: 280, parking: 2, pool: true, garden: false, energyCertificate: 'A', walkScore: 78 },
    images: [
      { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', alt: 'Vista da varanda', isPrimary: true },
    ],
    status: 'available',
    listingType: 'sale',
    agent: { name: 'Ana Ferreira', agency: 'Imobiliária Casa dos Sonhos' },
    tags: ['Vista Mar', 'Segurança 24h', 'Luxo'],
    createdAt: '2026-03-20T09:00:00Z',
    updatedAt: '2026-05-01T11:00:00Z',
  },
  {
    id: 'prop-003',
    title: 'Palacete Renovado em Cascais',
    description: 'Exemplar único de arquitetura manuelina revitalizada. Pátio interior com jardim zen, piscina aquecida e adega climatizada. A 5 minutos a pé da marina. Certificação energética A+.',
    price: 4500000,
    currency: 'EUR',
    location: {
      address: 'Rua do Visconde da Luz, 120',
      city: 'Cascais',
      country: 'PT',
      neighborhood: 'Centro Histórico',
      coordinates: { latitude: 38.697, longitude: -9.422 },
    },
    typology: 'T6',
    features: { bedrooms: 6, bathrooms: 7, sqm: 580, parking: 4, pool: true, garden: true, energyCertificate: 'A+', walkScore: 91 },
    images: [
      { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80', alt: 'Fachada histórica', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', alt: 'Jardim interior' },
    ],
    status: 'available',
    listingType: 'sale',
    agent: { name: 'Sofia Ribeiro', agency: 'Private Selection Portugal' },
    tags: ['Património', 'A+', 'Marina'],
    createdAt: '2026-04-28T08:00:00Z',
    updatedAt: '2026-05-09T10:00:00Z',
  },
  {
    id: 'prop-004',
    title: 'Penthouse com Rooftop em Lisboa',
    description: 'Duplex no topo do edifício ICON. Rooftop privado de 120m², jacuzzi exterior, cozinha de verão. Vista 360° sobre o Tejo e Castelo de São Jorge.',
    price: 3200000,
    currency: 'EUR',
    location: {
      address: 'Avenida da Liberdade, 245, Piso 15',
      city: 'Lisboa',
      country: 'PT',
      neighborhood: 'Avenidas Novas',
      coordinates: { latitude: 38.7223, longitude: -9.1453 },
    },
    typology: 'T4',
    features: { bedrooms: 4, bathrooms: 5, sqm: 350, parking: 2, pool: false, garden: false, energyCertificate: 'A', walkScore: 96 },
    images: [
      { url: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80', alt: 'Rooftop privado', isPrimary: true },
    ],
    status: 'available',
    listingType: 'sale',
    agent: { name: 'Miguel Torres', agency: 'Sotheby\'s Portugal' },
    tags: ['Rooftop', 'Vista Tejo', 'Duplex'],
    createdAt: '2026-04-10T12:00:00Z',
    updatedAt: '2026-05-07T09:30:00Z',
  },
  {
    id: 'prop-005',
    title: 'Loft Industrial no Porto',
    description: 'Conversão de armazém do século XIX em espaço contemporâneo. Tetos de 5m, janelas industriais originais, piso em microcimento. Zona das Artes, a 3 minutos da Casa da Música.',
    price: 985000,
    currency: 'EUR',
    location: {
      address: 'Rua de Miguel Bombarda, 45',
      city: 'Porto',
      country: 'PT',
      neighborhood: 'Cedofeita',
      coordinates: { latitude: 41.1485, longitude: -8.611 },
    },
    typology: 'T2',
    features: { bedrooms: 2, bathrooms: 2, sqm: 145, parking: 1, pool: false, garden: false, energyCertificate: 'B', walkScore: 94 },
    images: [
      { url: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=80', alt: 'Sala loft', isPrimary: true },
    ],
    status: 'available',
    listingType: 'sale',
    agent: { name: 'Inês Costa', agency: 'Remax Premium Porto' },
    tags: ['Loft', 'Design', 'Casa da Música'],
    createdAt: '2026-04-22T15:00:00Z',
    updatedAt: '2026-05-08T16:00:00Z',
  },
  {
    id: 'prop-006',
    title: 'Vila Premium em Miramar',
    description: 'Residência exclusiva em condomínio fechado de alta segurança. Piscina infinita, smart home integrada, gerador autónomo. Ideal para expatriados e diplomatas.',
    price: 4200000000,
    currency: 'AOA',
    location: {
      address: 'Condomínio Miramar Premium, Via A1',
      city: 'Luanda',
      country: 'AO',
      neighborhood: 'Miramar',
      coordinates: { latitude: -8.8333, longitude: 13.25 },
    },
    typology: 'T5',
    features: { bedrooms: 5, bathrooms: 6, sqm: 500, parking: 4, pool: true, garden: true, energyCertificate: 'A', walkScore: 45 },
    images: [
      { url: 'https://images.unsplash.com/photo-1605146768851-eda79da39897?w=800&q=80', alt: 'Piscina infinita', isPrimary: true },
    ],
    status: 'available',
    listingType: 'sale',
    agent: { name: 'Pedro Lopes', agency: 'GM Imobiliária' },
    tags: ['Segurança 24h', 'Smart Home', 'Gerador'],
    createdAt: '2026-04-05T11:00:00Z',
    updatedAt: '2026-05-06T13:00:00Z',
  },
];

export function formatCurrency(value: number, currency: Property['currency']): string {
  const formatter = new Intl.NumberFormat(
    currency === 'AOA' ? 'pt-AO' : 'pt-PT',
    { style: 'currency', currency, maximumFractionDigits: 0 }
  );
  return formatter.format(value);
}

export function getWalkScoreLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Paraíso a Pé', color: 'text-emerald-700 bg-emerald-50' };
  if (score >= 70) return { label: 'Muito Caminhabilidade', color: 'text-teal-700 bg-teal-50' };
  if (score >= 50) return { label: 'Caminhabilidade Moderada', color: 'text-amber-700 bg-amber-50' };
  return { label: 'Dependente de Carro', color: 'text-stone-600 bg-stone-100' };
}
