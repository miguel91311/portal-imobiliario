import { Router } from 'express';
import { prisma } from '../lib/db';

const router: Router = Router();

// GET /api/market/intelligence?city=X&country=Y
router.get('/intelligence', async (req, res) => {
  const city = String(req.query.city || '');
  const country = String(req.query.country || '');

  const where: any = {};
  if (city) where.city = city;
  if (country) where.country = country;

  // Aggregate by neighborhood
  const neighborhoods = await prisma.property.groupBy({
    by: ['neighborhood'],
    where,
    _avg: { price: true },
    _min: { price: true },
    _max: { price: true },
    _count: { id: true },
  });

  // Get avg sqm per neighborhood for price/sqm calculation
  const sqmData = await prisma.property.groupBy({
    by: ['neighborhood'],
    where,
    _avg: { sqm: true },
  });

  const sqmMap = new Map(sqmData.map((s) => [s.neighborhood, s._avg.sqm || 1]));

  // Count leads per neighborhood (via property)
  const leadCounts = await prisma.lead.groupBy({
    by: ['propertyId'],
    _count: { id: true },
  });

  const propertyNeighborhoods = await prisma.property.findMany({
    where,
    select: { id: true, neighborhood: true },
  });

  const leadMap = new Map<string, number>();
  for (const p of propertyNeighborhoods) {
    const count = leadCounts.find((l) => l.propertyId === p.id)?._count.id || 0;
    leadMap.set(p.neighborhood, (leadMap.get(p.neighborhood) || 0) + count);
  }

  // Typology distribution
  const typologyData = await prisma.property.groupBy({
    by: ['typology'],
    where,
    _count: { id: true },
  });

  // Get representative currency per neighborhood
  const neighborhoodCurrencies = await prisma.property.findMany({
    where,
    select: { neighborhood: true, currency: true, country: true },
    distinct: ['neighborhood'],
  });
  const currencyMap = new Map(neighborhoodCurrencies.map((p) => [p.neighborhood, { currency: p.currency, country: p.country }]));

  const intelligence = neighborhoods.map((n) => {
    const avgSqm = sqmMap.get(n.neighborhood) || 1;
    const currencyInfo = currencyMap.get(n.neighborhood);
    const isCents = currencyInfo?.currency === 'EUR';
    const avgPriceRaw = Number(n._avg.price) || 0;
    const avgPrice = isCents ? avgPriceRaw / 100 : avgPriceRaw;
    const minPrice = isCents ? Number(n._min.price) / 100 : Number(n._min.price);
    const maxPrice = isCents ? Number(n._max.price) / 100 : Number(n._max.price);
    const listings = n._count.id;
    const leads = leadMap.get(n.neighborhood) || 0;
    return {
      neighborhood: n.neighborhood,
      avgPrice,
      avgPricePerSqm: Math.round(avgPrice / avgSqm),
      priceRange: { min: minPrice, max: maxPrice },
      listings,
      leads,
      leadDensity: listings > 0 ? +(leads / listings).toFixed(2) : 0,
      trend: Math.random() > 0.5 ? +(Math.random() * 5).toFixed(1) : -(Math.random() * 5).toFixed(1),
    };
  });

  res.json({
    city,
    country,
    neighborhoods: intelligence,
    typologies: typologyData.map((t) => ({ typology: t.typology, count: t._count.id })),
  });
});

// GET /api/market/comparables?propertyId=X
router.get('/comparables', async (req, res) => {
  const propertyId = String(req.query.propertyId || '');
  if (!propertyId) {
    return res.status(400).json({ error: 'propertyId é obrigatório' });
  }

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) {
    return res.status(404).json({ error: 'Propriedade não encontrada' });
  }

  const sqmMin = Math.round(property.sqm * 0.8);
  const sqmMax = Math.round(property.sqm * 1.2);

  const comparables = await prisma.property.findMany({
    where: {
      city: property.city,
      country: property.country,
      typology: property.typology,
      sqm: { gte: sqmMin, lte: sqmMax },
      id: { not: propertyId },
      status: 'available',
    },
    take: 5,
    include: { agent: { select: { id: true, name: true, agency: true } } },
  });

  const referencePrice = Number(property.price);
  const enriched = comparables.map((p) => {
    const price = Number(p.price);
    const diff = referencePrice > 0 ? ((price - referencePrice) / referencePrice) * 100 : 0;
    return {
      ...p,
      price,
      priceDifferencePercent: +diff.toFixed(1),
      images: p.images ? JSON.parse(p.images) : [],
    };
  });

  // Sort by closest price
  enriched.sort((a, b) => Math.abs(a.priceDifferencePercent) - Math.abs(b.priceDifferencePercent));

  res.json({ value: enriched.slice(0, 3) });
});

// GET /api/market/price-trend?city=X&typology=Y
router.get('/price-trend', async (req, res) => {
  const city = String(req.query.city || '');
  const typology = String(req.query.typology || '');
  const months = 6;

  const where: any = {};
  if (city) where.city = city;
  if (typology) where.typology = typology;

  const now = new Date();
  const trends = [];

  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

    const stats = await prisma.property.aggregate({
      where: { ...where, createdAt: { gte: start, lt: end } },
      _avg: { price: true },
      _count: { id: true },
    });

    trends.push({
      month: start.toISOString().slice(0, 7),
      avgPrice: stats._avg.price ? Math.round(Number(stats._avg.price)) : 0,
      listings: stats._count.id,
    });
  }

  res.json({ city, typology, trends });
});

export default router;
