import { Router } from 'express';
import { prisma } from '../lib/db';
import { authenticateToken } from '../middleware/auth';

const router: Router = Router();

// GET /api/valuations
router.get('/', authenticateToken, async (req, res) => {
  const where: any = {};
  if (req.query.propertyId) where.propertyId = String(req.query.propertyId);

  const valuations = await prisma.valuation.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { property: { select: { title: true, city: true, country: true } } },
  });

  res.json({
    value: valuations.map((v) => ({
      ...v,
      estimatedValue: Number(v.estimatedValue),
      factors: v.factors ? JSON.parse(v.factors) : null,
    })),
  });
});

// GET /api/valuations/:id
router.get('/:id', authenticateToken, async (req, res) => {
  const valuation = await prisma.valuation.findUnique({
    where: { id: req.params.id },
    include: { property: { select: { title: true, city: true, country: true } } },
  });

  if (!valuation) {
    return res.status(404).json({ error: 'Avaliação não encontrada' });
  }

  res.json({
    ...valuation,
    estimatedValue: Number(valuation.estimatedValue),
    factors: valuation.factors ? JSON.parse(valuation.factors) : null,
  });
});

export default router;
