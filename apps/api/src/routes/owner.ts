import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { getPlanLimits } from '../lib/plans';

const router: Router = Router();

// GET /api/owner/me/stats — Dashboard stats for owner
router.get(
  '/me/stats',
  authenticateToken,
  requireRole('owner'),
  async (req: AuthRequest, res) => {
    const userId = req.user!.userId;

    const [totalProperties, totalViews, totalContacts, featuredCount] = await Promise.all([
      prisma.property.count({ where: { ownerId: userId } }),
      prisma.property.aggregate({ where: { ownerId: userId }, _sum: { viewCount: true } }),
      prisma.property.aggregate({ where: { ownerId: userId }, _sum: { contactCount: true } }),
      prisma.property.count({ where: { ownerId: userId, featured: true } }),
    ]);

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { freeListingsUsed: true } });
    res.json({
      totalProperties,
      totalViews: totalViews._sum.viewCount || 0,
      totalContacts: totalContacts._sum.contactCount || 0,
      featuredCount,
      freeListingsRemaining: Math.max(0, 3 - (user?.freeListingsUsed || 0)),
    });
  }
);

// GET /api/owner/me/listings — Owner's properties
router.get(
  '/me/listings',
  authenticateToken,
  requireRole('owner'),
  async (req: AuthRequest, res) => {
    const userId = req.user!.userId;
    const skip = Number(req.query.$skip) || 0;
    const take = Number(req.query.$top) || 50;

    const [properties, count] = await Promise.all([
      prisma.property.findMany({
        where: { ownerId: userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { agent: { select: { id: true, name: true, agency: true } } },
      }),
      prisma.property.count({ where: { ownerId: userId } }),
    ]);

    res.json({
      '@odata.count': count,
      value: properties.map((p: any) => ({
        ...p,
        price: p.currency === 'EUR' ? Number(p.price) / 100 : Number(p.price),
        tags: p.tags ? JSON.parse(p.tags) : [],
        images: p.images ? JSON.parse(p.images) : [],
      })),
    });
  }
);

// POST /api/owner/me/purchase-featured — Buy featured package
const purchaseSchema = z.object({
  propertyId: z.string(),
  packageId: z.string(),
});

router.post(
  '/me/purchase-featured',
  authenticateToken,
  requireRole('owner'),
  async (req: AuthRequest, res) => {
    const result = purchaseSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
    }

    const { propertyId, packageId } = result.data;
    const userId = req.user!.userId;

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property || property.ownerId !== userId) {
      return res.status(404).json({ error: 'Propriedade não encontrada' });
    }

    const pkg = await prisma.featuredPackage.findUnique({ where: { id: packageId } });
    if (!pkg || !pkg.isActive) {
      return res.status(404).json({ error: 'Pacote não encontrado' });
    }

    const until = new Date();
    until.setDate(until.getDate() + pkg.durationDays);

    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: {
        featured: true,
        featuredUntil: until,
        featuredLevel: pkg.name,
      },
    });

    res.json({ message: 'Destaque ativado com sucesso', property: updated });
  }
);

// POST /api/owner/me/purchase-sprint — Quick €2/week highlight
router.post(
  '/me/purchase-sprint',
  authenticateToken,
  requireRole('owner', 'agent'),
  async (req: AuthRequest, res) => {
    const schema = z.object({ propertyId: z.string() });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
    }

    const { propertyId } = result.data;
    const userId = req.user!.userId;

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property || (property.ownerId !== userId && property.agentId !== userId)) {
      return res.status(404).json({ error: 'Propriedade não encontrada' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.featuredCredits < 1) {
      return res.status(402).json({ error: 'Créditos de destaque insuficientes. Compre créditos para continuar.' });
    }

    const until = new Date();
    until.setDate(until.getDate() + 7);

    const [updated] = await prisma.$transaction([
      prisma.property.update({
        where: { id: propertyId },
        data: {
          featured: true,
          featuredUntil: until,
          featuredLevel: 'Sprint',
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { featuredCredits: { decrement: 1 } },
      }),
    ]);

    res.json({ message: 'Destaque Sprint ativado por 7 dias', property: updated });
  }
);

// POST /api/owner/me/buy-credits — Buy featured credits (simulated payment)
router.post(
  '/me/buy-credits',
  authenticateToken,
  requireRole('owner', 'agent'),
  async (req: AuthRequest, res) => {
    const schema = z.object({ quantity: z.number().min(1).max(100) });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    const { quantity } = result.data;
    const userId = req.user!.userId;
    const totalPrice = quantity * 2; // €2 per credit

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { featuredCredits: { increment: quantity } },
    });

    res.json({
      message: `${quantity} crédito(s) de destaque adquiridos`,
      totalPrice,
      featuredCredits: updated.featuredCredits,
    });
  }
);

// GET /api/owner/me/plan — Current plan and limits
router.get(
  '/me/plan',
  authenticateToken,
  requireRole('owner', 'agent', 'admin'),
  async (req: AuthRequest, res) => {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        planType: true,
        planExpiresAt: true,
        listingCount: true,
        freeListingsUsed: true,
        featuredCredits: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    const limits = getPlanLimits(user.planType);
    const activeListings = await prisma.property.count({
      where: user.role === 'owner'
        ? { ownerId: userId }
        : { agentId: userId },
    });

    res.json({
      planType: user.planType,
      planExpiresAt: user.planExpiresAt,
      planName: limits.name,
      planPrice: limits.price,
      listingLimit: limits.listingLimit,
      listingsUsed: activeListings,
      listingsRemaining: Math.max(0, limits.listingLimit - activeListings),
      featuredCredits: user.featuredCredits,
      freeListingsUsed: user.freeListingsUsed,
      freeListingsRemaining: Math.max(0, 3 - user.freeListingsUsed),
    });
  }
);

export default router;
