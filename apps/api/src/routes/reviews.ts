import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router: Router = Router();

// GET /api/reviews/:agentId — List reviews for an agent
router.get('/:agentId', async (req, res) => {
  const reviews = await prisma.agentReview.findMany({
    where: { agentId: req.params.agentId },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const stats = await prisma.agentReview.aggregate({
    where: { agentId: req.params.agentId },
    _avg: { rating: true },
    _count: { id: true },
  });

  res.json({
    value: reviews,
    stats: {
      average: stats._avg.rating ? +stats._avg.rating.toFixed(1) : 0,
      count: stats._count.id,
    },
  });
});

// POST /api/reviews — Create review
router.post(
  '/',
  authenticateToken,
  async (req: AuthRequest, res) => {
    const schema = z.object({
      agentId: z.string(),
      propertyId: z.string().optional(),
      rating: z.number().min(1).max(5),
      title: z.string().min(3).optional(),
      comment: z.string().min(10).optional(),
    });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
    }

    if (result.data.agentId === req.user!.userId) {
      return res.status(400).json({ error: 'Não pode avaliar-se a si mesmo' });
    }

    const existing = await prisma.agentReview.findFirst({
      where: { agentId: result.data.agentId, authorId: req.user!.userId },
    });
    if (existing) {
      return res.status(409).json({ error: 'Já avaliou este agente' });
    }

    const review = await prisma.agentReview.create({
      data: {
        ...result.data,
        authorId: req.user!.userId,
      },
    });

    res.status(201).json(review);
  }
);

// DELETE /api/reviews/:id
router.delete(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res) => {
    const review = await prisma.agentReview.findUnique({ where: { id: req.params.id } });
    if (!review) return res.status(404).json({ error: 'Avaliação não encontrada' });
    if (review.authorId !== req.user!.userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Não autorizado' });
    }
    await prisma.agentReview.delete({ where: { id: req.params.id } });
    res.json({ message: 'Avaliação eliminada' });
  }
);

export default router;
