import { Router } from 'express';
import { prisma } from '../lib/db';

const router: Router = Router();

// GET /api/aggregator/search?city=X&country=Y&typology=Z&limit=10
router.get('/search', async (req, res) => {
  const city = String(req.query.city || '');
  const country = String(req.query.country || '');
  const typology = String(req.query.typology || '');
  const limit = Math.min(Number(req.query.limit) || 10, 50);

  const where: any = {};
  if (city) where.city = city;
  if (country) where.country = country;
  if (typology) where.typology = typology;

  const listings = await prisma.aggregatedListing.findMany({
    where,
    orderBy: { scrapedAt: 'desc' },
    take: limit,
  });

  res.json({
    value: listings.map((l) => ({
      ...l,
      price: l.currency === 'EUR' ? Number(l.price) / 100 : Number(l.price),
    })),
  });
});

// GET /api/aggregator/sources — List available source portals
router.get('/sources', async (_req, res) => {
  const sources = await prisma.aggregatedListing.groupBy({
    by: ['sourcePortal'],
    _count: { id: true },
  });

  res.json({
    value: sources.map((s) => ({
      portal: s.sourcePortal,
      count: s._count.id,
      url: `https://${s.sourcePortal}.pt`,
    })),
  });
});

export default router;
