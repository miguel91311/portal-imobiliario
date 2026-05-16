import { Router } from 'express';
import { prisma } from '../lib/db';
import { authenticateToken, requireRole } from '../middleware/auth';

const router: Router = Router();

// GET /api/featured-packages — List all active packages
router.get('/', async (_req, res) => {
  const packages = await prisma.featuredPackage.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' },
  });

  res.json({
    value: packages.map((p) => ({
      ...p,
      price: Number(p.price) / 100,
      features: p.features ? JSON.parse(p.features) : [],
    })),
  });
});

// POST /api/featured-packages — Create package (admin only)
router.post(
  '/',
  authenticateToken,
  requireRole('admin'),
  async (req, res) => {
    const { name, description, price, durationDays, features } = req.body;
    const pkg = await prisma.featuredPackage.create({
      data: {
        name,
        description,
        price: Math.round(price * 100),
        durationDays,
        features: features ? JSON.stringify(features) : null,
      },
    });
    res.status(201).json(pkg);
  }
);

export default router;
