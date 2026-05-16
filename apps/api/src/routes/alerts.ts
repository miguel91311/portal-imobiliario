import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router: Router = Router();

// GET /api/alerts — List alerts for user or by email
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  const alerts = await prisma.alert.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ value: alerts });
});

// POST /api/alerts — Create alert (auth or anonymous with email)
const createAlertSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  country: z.enum(['PT', 'AO']),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  typology: z.string().optional(),
  listingType: z.enum(['sale', 'rent']).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minSqm: z.number().optional(),
  maxSqm: z.number().optional(),
  bedrooms: z.number().optional(),
  hasPool: z.boolean().optional(),
  hasGarden: z.boolean().optional(),
  frequency: z.enum(['instant', 'daily', 'weekly']).default('daily'),
});

router.post('/', async (req, res) => {
  const result = createAlertSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
  }

  const alert = await prisma.alert.create({
    data: {
      ...result.data,
      userId: (req as AuthRequest).user?.userId || null,
    },
  });

  res.status(201).json(alert);
});

// DELETE /api/alerts/:id
router.delete(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res) => {
    const alert = await prisma.alert.findUnique({ where: { id: req.params.id } });
    if (!alert) return res.status(404).json({ error: 'Alerta não encontrado' });
    if (alert.userId && alert.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'Não autorizado' });
    }
    await prisma.alert.delete({ where: { id: req.params.id } });
    res.json({ message: 'Alerta eliminado' });
  }
);

// PATCH /api/alerts/:id/toggle
router.patch(
  '/:id/toggle',
  authenticateToken,
  async (req: AuthRequest, res) => {
    const alert = await prisma.alert.findUnique({ where: { id: req.params.id } });
    if (!alert) return res.status(404).json({ error: 'Alerta não encontrado' });
    if (alert.userId && alert.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'Não autorizado' });
    }
    const updated = await prisma.alert.update({
      where: { id: req.params.id },
      data: { isActive: !alert.isActive },
    });
    res.json(updated);
  }
);

// POST /api/alerts/:id/test — Simulate alert trigger
router.post(
  '/:id/test',
  authenticateToken,
  async (req: AuthRequest, res) => {
    const alert = await prisma.alert.findUnique({ where: { id: req.params.id } });
    if (!alert) return res.status(404).json({ error: 'Alerta não encontrado' });
    if (alert.userId && alert.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'Não autorizado' });
    }

    const where: any = { country: alert.country, status: 'available' };
    if (alert.city) where.city = alert.city;
    if (alert.neighborhood) where.neighborhood = alert.neighborhood;
    if (alert.typology) where.typology = alert.typology;
    if (alert.listingType) where.listingType = alert.listingType;
    if (alert.bedrooms) where.bedrooms = { gte: alert.bedrooms };
    if (alert.minPrice || alert.maxPrice) {
      where.price = {};
      if (alert.minPrice) where.price.gte = alert.minPrice;
      if (alert.maxPrice) where.price.lte = alert.maxPrice;
    }
    if (alert.minSqm || alert.maxSqm) {
      where.sqm = {};
      if (alert.minSqm) where.sqm.gte = alert.minSqm;
      if (alert.maxSqm) where.sqm.lte = alert.maxSqm;
    }
    if (alert.hasPool !== null) where.pool = alert.hasPool;
    if (alert.hasGarden !== null) where.garden = alert.hasGarden;

    const properties = await prisma.property.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { agent: { select: { name: true, agency: true } } },
    });

    res.json({
      alertId: alert.id,
      criteria: where,
      matches: properties.length,
      properties: properties.map((p) => ({
        id: p.id,
        title: p.title,
        price: p.currency === 'EUR' ? Number(p.price) / 100 : Number(p.price),
        currency: p.currency,
        city: p.city,
        neighborhood: p.neighborhood,
        typology: p.typology,
        images: p.images ? JSON.parse(p.images) : [],
      })),
    });
  }
);

export default router;
