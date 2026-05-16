import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router: Router = Router();

// GET /api/favorites — List user favorites
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.user!.userId },
    include: {
      property: {
        include: {
          agent: { select: { id: true, name: true, agency: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const formatted = favorites.map((f) => ({
    ...f,
    property: {
      ...f.property,
      price: f.property.currency === 'EUR' ? Number(f.property.price) / 100 : Number(f.property.price),
      images: f.property.images ? JSON.parse(f.property.images) : [],
      tags: f.property.tags ? JSON.parse(f.property.tags) : [],
    },
  }));

  res.json({ value: formatted });
});

// POST /api/favorites
router.post(
  '/',
  authenticateToken,
  async (req: AuthRequest, res) => {
    const schema = z.object({ propertyId: z.string(), notes: z.string().optional() });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
    }

    const existing = await prisma.favorite.findUnique({
      where: { userId_propertyId: { userId: req.user!.userId, propertyId: result.data.propertyId } },
    });
    if (existing) {
      return res.status(409).json({ error: 'Já nos favoritos' });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: req.user!.userId,
        propertyId: result.data.propertyId,
        notes: result.data.notes,
      },
    });

    res.status(201).json(favorite);
  }
);

// DELETE /api/favorites/:propertyId
router.delete(
  '/:propertyId',
  authenticateToken,
  async (req: AuthRequest, res) => {
    await prisma.favorite.deleteMany({
      where: { userId: req.user!.userId, propertyId: req.params.propertyId },
    });
    res.json({ message: 'Removido dos favoritos' });
  }
);

// PATCH /api/favorites/:id/notes
router.patch(
  '/:id/notes',
  authenticateToken,
  async (req: AuthRequest, res) => {
    const favorite = await prisma.favorite.findUnique({ where: { id: req.params.id } });
    if (!favorite || favorite.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'Não autorizado' });
    }
    const updated = await prisma.favorite.update({
      where: { id: req.params.id },
      data: { notes: req.body.notes },
    });
    res.json(updated);
  }
);

export default router;
