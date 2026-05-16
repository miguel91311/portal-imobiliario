import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { getUserTeam } from './teams';
import { canCreateListing } from '../lib/plans';


const router: Router = Router();

function toPropertyResponse(p: any) {
  // Convert price from cents (EUR) to units for frontend
  const price = p.currency === 'EUR' ? Number(p.price) / 100 : Number(p.price);
  return {
    ...p,
    price,
    tags: p.tags ? JSON.parse(p.tags) : [],
    images: p.images ? JSON.parse(p.images) : [],
    features: {
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      sqm: p.sqm,
      parking: p.parking,
      pool: p.pool,
      garden: p.garden,
      energyCertificate: p.energyCertificate,
      walkScore: p.walkScore,
      elevator: p.elevator,
      balcony: p.balcony,
      terrace: p.terrace,
      airConditioning: p.airConditioning,
      storageRoom: p.storageRoom,
      condition: p.condition,
      floor: p.floor,
      constructionYear: p.constructionYear,
      hideAddress: p.hideAddress,
      door: p.door,
      block: p.block,
      urbanization: p.urbanization,
      propertyType: p.propertyType,
      situation: p.situation,
      hasFloorPlan: p.hasFloorPlan,
      hasVirtualTour: p.hasVirtualTour,
    },
    location: {
      address: p.address,
      city: p.city,
      country: p.country,
      neighborhood: p.neighborhood,
      coordinates: { latitude: p.latitude, longitude: p.longitude },
    },
  };
}

// GET /api/properties — OData-like filtering
router.get('/', async (req, res) => {
  const where: any = {};

  if (req.query.country) where.country = req.query.country;
  if (req.query.city) where.city = { contains: String(req.query.city), mode: 'insensitive' };
  if (req.query.typology) where.typology = req.query.typology;
  if (req.query.listingType) where.listingType = req.query.listingType;
  if (req.query.status) where.status = req.query.status;
  if (req.query.agentId) where.agentId = req.query.agentId;
  if (req.query.ownerId) where.ownerId = req.query.ownerId;
  if (req.query.teamId) where.teamId = req.query.teamId;

  // Price filter
  if (req.query.minPrice || req.query.maxPrice) {
    where.price = {};
    if (req.query.minPrice) where.price.gte = Number(req.query.minPrice);
    if (req.query.maxPrice) where.price.lte = Number(req.query.maxPrice);
  }

  // Feature filters
  if (req.query.bedrooms) where.bedrooms = { gte: Number(req.query.bedrooms) };
  if (req.query.bathrooms) where.bathrooms = { gte: Number(req.query.bathrooms) };
  if (req.query.pool) where.pool = req.query.pool === 'true';
  if (req.query.garden) where.garden = req.query.garden === 'true';
  if (req.query.parking) where.parking = { gte: Number(req.query.parking) };
  if (req.query.elevator) where.elevator = req.query.elevator === 'true';
  if (req.query.balcony) where.balcony = req.query.balcony === 'true';
  if (req.query.terrace) where.terrace = req.query.terrace === 'true';
  if (req.query.airConditioning) where.airConditioning = req.query.airConditioning === 'true';
  if (req.query.storageRoom) where.storageRoom = req.query.storageRoom === 'true';
  if (req.query.condition) where.condition = req.query.condition;
  if (req.query.floor) where.floor = req.query.floor;
  if (req.query.propertyType) where.propertyType = req.query.propertyType;
  if (req.query.situation) where.situation = req.query.situation;
  if (req.query.hasFloorPlan) where.hasFloorPlan = req.query.hasFloorPlan === 'true';
  if (req.query.hasVirtualTour) where.hasVirtualTour = req.query.hasVirtualTour === 'true';
  if (req.query.energyCertificate) where.energyCertificate = req.query.energyCertificate;

  // Area filter
  if (req.query.minSqm || req.query.maxSqm) {
    where.sqm = {};
    if (req.query.minSqm) where.sqm.gte = Number(req.query.minSqm);
    if (req.query.maxSqm) where.sqm.lte = Number(req.query.maxSqm);
  }

  // Search
  if (req.query.search) {
    const q = String(req.query.search);
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { neighborhood: { contains: q, mode: 'insensitive' } },
      { city: { contains: q, mode: 'insensitive' } },
    ];
  }

  const skip = Number(req.query.$skip) || 0;
  const take = Number(req.query.$top) || 50;

  const [properties, count] = await Promise.all([
    prisma.property.findMany({ where, skip, take, include: { agent: { select: { id: true, name: true, agency: true } }, owner: { select: { id: true, name: true } } } }),
    prisma.property.count({ where }),
  ]);

  res.json({
    '@odata.count': count,
    value: properties.map(toPropertyResponse),
  });
});

// GET /api/properties/:id
router.get('/:id', async (req, res) => {
  const property = await prisma.property.findUnique({
    where: { id: req.params.id },
    include: { agent: { select: { id: true, name: true, agency: true } }, owner: { select: { id: true, name: true } } },
  });

  if (!property) {
    return res.status(404).json({ error: 'Propriedade não encontrada' });
  }

  // Increment view count
  await prisma.property.update({
    where: { id: req.params.id },
    data: { viewCount: { increment: 1 } },
  });

  // Fetch recent valuations
  const valuations = await prisma.valuation.findMany({
    where: { propertyId: req.params.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // Fetch comparables
  const sqmMin = Math.round(property.sqm * 0.8);
  const sqmMax = Math.round(property.sqm * 1.2);
  const comparables = await prisma.property.findMany({
    where: {
      city: property.city,
      country: property.country,
      typology: property.typology,
      sqm: { gte: sqmMin, lte: sqmMax },
      id: { not: req.params.id },
      status: 'available',
    },
    take: 3,
    include: { agent: { select: { id: true, name: true } } },
  });

  const referencePrice = Number(property.price);
  const enrichedComparables = comparables.map((p) => {
    const price = Number(p.price);
    const diff = referencePrice > 0 ? ((price - referencePrice) / referencePrice) * 100 : 0;
    return {
      ...toPropertyResponse(p),
      priceDifferencePercent: +diff.toFixed(1),
    };
  }).sort((a, b) => Math.abs(a.priceDifferencePercent) - Math.abs(b.priceDifferencePercent));

  // Market average for neighborhood
  const marketAvg = await prisma.property.aggregate({
    where: { city: property.city, neighborhood: property.neighborhood, status: 'available' },
    _avg: { price: true },
  });
  const marketAvgPrice = Number(marketAvg._avg.price) || 0;
  const marketDiff = marketAvgPrice > 0 ? ((referencePrice - marketAvgPrice) / marketAvgPrice) * 100 : 0;

  const response = toPropertyResponse(property);
  response.agent = property.agent ? { name: property.agent.name, agency: property.agent.agency || '' } : undefined;
  response.valuations = valuations.map((v) => ({
    ...v,
    estimatedValue: Number(v.estimatedValue),
    factors: v.factors ? JSON.parse(v.factors) : null,
  }));
  response.comparables = enrichedComparables;
  response.marketAnalysis = {
    neighborhoodAvg: marketAvgPrice,
    priceDifferencePercent: +marketDiff.toFixed(1),
  };

  res.json(response);
});

// POST /api/properties
const createPropertySchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  price: z.number().positive(),
  currency: z.enum(['EUR', 'AOA', 'USD']),
  location: z.object({
    address: z.string(),
    city: z.string(),
    country: z.enum(['PT', 'AO']),
    neighborhood: z.string(),
    coordinates: z.object({ latitude: z.number(), longitude: z.number() }),
  }),
  typology: z.string(),
  features: z.object({
    bedrooms: z.number(),
    bathrooms: z.number(),
    sqm: z.number(),
    parking: z.number().optional(),
    pool: z.boolean().optional(),
    garden: z.boolean().optional(),
    energyCertificate: z.string().optional(),
    walkScore: z.number().optional(),
    elevator: z.boolean().optional(),
    balcony: z.boolean().optional(),
    terrace: z.boolean().optional(),
    airConditioning: z.boolean().optional(),
    storageRoom: z.boolean().optional(),
    condition: z.string().optional(),
    floor: z.string().optional(),
    constructionYear: z.number().optional(),
    hideAddress: z.boolean().optional(),
    door: z.string().optional(),
    block: z.string().optional(),
    urbanization: z.string().optional(),
    propertyType: z.string().optional(),
    situation: z.string().optional(),
    hasFloorPlan: z.boolean().optional(),
    hasVirtualTour: z.boolean().optional(),
  }),
  images: z.array(z.object({ url: z.string(), alt: z.string(), isPrimary: z.boolean().optional() })),
  listingType: z.enum(['sale', 'rent']),
  tags: z.array(z.string()).optional(),
});

router.post(
  '/',
  authenticateToken,
  requireRole('agent', 'admin', 'owner'),
  async (req: AuthRequest, res) => {
    const result = createPropertySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
    }

    const data = result.data;
    // Convert EUR to cents for storage
    const priceInCents = data.currency === 'EUR' ? Math.round(data.price * 100) : data.price;

    // Validate listing limits by plan
    const isOwner = req.user!.role === 'owner';
    const userRecord = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!userRecord) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }
    const check = canCreateListing(
      req.user!.role,
      userRecord.planType,
      userRecord.listingCount,
      userRecord.freeListingsUsed
    );
    if (!check.allowed) {
      return res.status(403).json({ error: check.reason });
    }

    // If agent has a team, auto-assign teamId
    let teamId = null;
    if (!isOwner) {
      const team = await getUserTeam(req.user!.userId);
      if (team) teamId = team.teamId;
    }

    const newProperty = await prisma.property.create({
      data: {
        title: data.title,
        description: data.description,
        price: priceInCents,
        currency: data.currency,
        address: data.location.address,
        city: data.location.city,
        country: data.location.country,
        neighborhood: data.location.neighborhood,
        latitude: data.location.coordinates.latitude,
        longitude: data.location.coordinates.longitude,
        typology: data.typology,
        bedrooms: data.features.bedrooms,
        bathrooms: data.features.bathrooms,
        sqm: data.features.sqm,
        parking: data.features.parking || 0,
        pool: data.features.pool || false,
        garden: data.features.garden || false,
        energyCertificate: data.features.energyCertificate,
        walkScore: data.features.walkScore,
        elevator: data.features.elevator || false,
        balcony: data.features.balcony || false,
        terrace: data.features.terrace || false,
        airConditioning: data.features.airConditioning || false,
        storageRoom: data.features.storageRoom || false,
        condition: data.features.condition,
        floor: data.features.floor,
        constructionYear: data.features.constructionYear,
        hideAddress: data.features.hideAddress || false,
        door: data.features.door,
        block: data.features.block,
        urbanization: data.features.urbanization,
        propertyType: data.features.propertyType,
        situation: data.features.situation,
        hasFloorPlan: data.features.hasFloorPlan || false,
        hasVirtualTour: data.features.hasVirtualTour || false,
        listingType: data.listingType,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        images: JSON.stringify(data.images),
        status: 'available',
        agentId: isOwner ? null : req.user!.userId,
        ownerId: isOwner ? req.user!.userId : null,
        teamId,
      },
    });

    // Increment owner counters
    if (isOwner) {
      await prisma.user.update({
        where: { id: req.user!.userId },
        data: {
          listingCount: { increment: 1 },
          freeListingsUsed: { increment: 1 },
        },
      });
    }

    res.status(201).json(toPropertyResponse(newProperty));
  }
);

// PATCH /api/properties/:id
router.patch(
  '/:id',
  authenticateToken,
  requireRole('admin', 'agent', 'owner'),
  async (req: AuthRequest, res) => {
    const property = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!property) {
      return res.status(404).json({ error: 'Propriedade não encontrada' });
    }

    if (req.user!.role === 'agent' && property.agentId !== req.user!.userId) {
      const team = await getUserTeam(req.user!.userId);
      if (!team || property.teamId !== team.teamId) {
        return res.status(403).json({ error: 'Não pode editar propriedades de outros agentes' });
      }
    }
    if (req.user!.role === 'owner' && property.ownerId !== req.user!.userId) {
      return res.status(403).json({ error: 'Não pode editar propriedades de outros proprietários' });
    }

    const updates = req.body;
    
    // Track price changes
    if (updates.price && Number(property.price) !== Math.round(updates.price * (property.currency === 'EUR' ? 100 : 1))) {
      const newPrice = property.currency === 'EUR' ? Math.round(updates.price * 100) : Math.round(updates.price);
      await prisma.priceHistory.create({
        data: {
          propertyId: property.id,
          oldPrice: property.price,
          newPrice: newPrice,
          reason: updates.priceChangeReason || 'market_adjustment',
        },
      });
      updates.price = newPrice;
    } else if (updates.price && property.currency === 'EUR') {
      updates.price = Math.round(updates.price * 100);
    }
    
    if (updates.tags) updates.tags = JSON.stringify(updates.tags);
    if (updates.images) updates.images = JSON.stringify(updates.images);

    const updated = await prisma.property.update({
      where: { id: req.params.id },
      data: updates,
    });

    res.json(toPropertyResponse(updated));
  }
);

// DELETE /api/properties/:id
router.delete(
  '/:id',
  authenticateToken,
  requireRole('admin', 'agent', 'owner'),
  async (req: AuthRequest, res) => {
    const property = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!property) {
      return res.status(404).json({ error: 'Propriedade não encontrada' });
    }

    if (req.user!.role === 'agent' && property.agentId !== req.user!.userId) {
      const team = await getUserTeam(req.user!.userId);
      if (!team || property.teamId !== team.teamId) {
        return res.status(403).json({ error: 'Não pode eliminar propriedades de outros agentes' });
      }
    }
    if (req.user!.role === 'owner' && property.ownerId !== req.user!.userId) {
      return res.status(403).json({ error: 'Não pode eliminar propriedades de outros proprietários' });
    }

    await prisma.property.delete({ where: { id: req.params.id } });

    // Decrement owner counter
    if (req.user!.role === 'owner') {
      await prisma.user.update({
        where: { id: req.user!.userId },
        data: { listingCount: { decrement: 1 } },
      });
    }

    res.json({ message: 'Propriedade eliminada com sucesso' });
  }
);

export default router;
