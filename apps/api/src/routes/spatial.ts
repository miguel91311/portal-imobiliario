import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';

const router: Router = Router();

/* ─── Nearby / Proximity Search ─── */
// POST /api/spatial/nearby
// Encontra propriedades dentro de um raio (km) de um ponto
router.post('/nearby', async (req, res) => {
  const schema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radiusKm: z.number().positive().max(100).default(5), // max 100km
    limit: z.number().max(100).default(50),
    listingType: z.enum(['sale', 'rent']).optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
  });

  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
  }

  const { latitude, longitude, radiusKm, limit, listingType, minPrice, maxPrice } = result.data;

  // Usar raw query PostGIS
  // ST_SetSRID(ST_MakePoint(long, lat), 4326) cria um ponto geográfico WGS84
  // ST_DWithin com geography calcula distância real em metros
  const whereConditions = [`ST_DWithin(
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
    ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
    ${radiusKm * 1000}
  )`];

  if (listingType) whereConditions.push(`"listingType" = '${listingType}'`);
  if (minPrice !== undefined) whereConditions.push(`price >= ${minPrice}`);
  if (maxPrice !== undefined) whereConditions.push(`price <= ${maxPrice}`);

  const whereClause = whereConditions.join(' AND ');

  const properties = await prisma.$queryRawUnsafe<any[]>(`
    SELECT 
      id, title, price, currency, "listingType", status,
      address, city, country, neighborhood,
      latitude, longitude, typology, bedrooms, bathrooms, sqm,
      parking, pool, garden, "energyCertificate", "walkScore",
      images, tags, "agentId", "viewCount", "contactCount",
      ST_Distance(
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
      ) / 1000.0 as distance_km
    FROM "Property"
    WHERE ${whereClause}
    ORDER BY distance_km ASC
    LIMIT ${limit}
  `);

  // Parse JSON fields
  const formatted = properties.map((p) => ({
    ...p,
    price: Number(p.price),
    distanceKm: Math.round(p.distance_km * 100) / 100,
    images: p.images ? JSON.parse(p.images) : [],
    tags: p.tags ? JSON.parse(p.tags) : [],
    features: {
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      sqm: p.sqm,
      parking: p.parking,
      pool: p.pool,
      garden: p.garden,
      energyCertificate: p.energyCertificate,
      walkScore: p.walkScore,
    },
    location: {
      address: p.address,
      city: p.city,
      country: p.country,
      neighborhood: p.neighborhood,
      coordinates: { latitude: p.latitude, longitude: p.longitude },
    },
  }));

  res.json({
    center: { latitude, longitude },
    radiusKm,
    count: formatted.length,
    value: formatted,
  });
});

/* ─── Polygon Search ─── */
// POST /api/spatial/within
// Propriedades dentro de um polígono desenhado no mapa
router.post('/within', async (req, res) => {
  const schema = z.object({
    coordinates: z.array(z.tuple([z.number(), z.number()])), // Array de [lng, lat]
    listingType: z.enum(['sale', 'rent']).optional(),
  });

  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
  }

  const { coordinates, listingType } = result.data;

  if (coordinates.length < 3) {
    return res.status(400).json({ error: 'Polígono precisa de pelo menos 3 pontos' });
  }

  // Fechar o polígono se necessário
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  const closedCoords = first[0] === last[0] && first[1] === last[1]
    ? coordinates
    : [...coordinates, first];

  const wktPoints = closedCoords.map(([lng, lat]) => `${lng} ${lat}`).join(', ');
  const polygonWKT = `POLYGON((${wktPoints}))`;

  const whereConditions = [`ST_Contains(
    ST_GeomFromText('${polygonWKT}', 4326),
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
  )`];

  if (listingType) whereConditions.push(`"listingType" = '${listingType}'`);

  const whereClause = whereConditions.join(' AND ');

  const properties = await prisma.$queryRawUnsafe<any[]>(`
    SELECT 
      id, title, price, currency, "listingType", status,
      address, city, country, neighborhood,
      latitude, longitude, typology, bedrooms, bathrooms, sqm,
      parking, pool, garden, "energyCertificate", "walkScore",
      images, tags, "agentId", "viewCount", "contactCount"
    FROM "Property"
    WHERE ${whereClause}
    LIMIT 100
  `);

  const formatted = properties.map((p) => ({
    ...p,
    price: Number(p.price),
    images: p.images ? JSON.parse(p.images) : [],
    tags: p.tags ? JSON.parse(p.tags) : [],
    features: {
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      sqm: p.sqm,
      parking: p.parking,
      pool: p.pool,
      garden: p.garden,
      energyCertificate: p.energyCertificate,
      walkScore: p.walkScore,
    },
    location: {
      address: p.address,
      city: p.city,
      country: p.country,
      neighborhood: p.neighborhood,
      coordinates: { latitude: p.latitude, longitude: p.longitude },
    },
  }));

  res.json({
    polygon: coordinates,
    count: formatted.length,
    value: formatted,
  });
});

/* ─── City/Neighborhood Stats ─── */
// GET /api/spatial/stats/:city
router.get('/stats/:city', async (req, res) => {
  const city = req.params.city;

  const stats = await prisma.$queryRawUnsafe<any[]>(`
    SELECT 
      COUNT(*) as total,
      AVG(price) as avg_price,
      MIN(price) as min_price,
      MAX(price) as max_price,
      AVG("walkScore") as avg_walk,
      neighborhood,
      currency
    FROM "Property"
    WHERE city = '${city}'
    GROUP BY neighborhood, currency
    ORDER BY total DESC
  `);

  res.json({
    city,
    neighborhoods: stats.map((s) => ({
      neighborhood: s.neighborhood,
      count: Number(s.total),
      avgPrice: Math.round(Number(s.avg_price)),
      minPrice: Math.round(Number(s.min_price)),
      maxPrice: Math.round(Number(s.max_price)),
      avgWalkScore: Math.round(Number(s.avg_walk)),
      currency: s.currency,
    })),
  });
});

export default router;
