import { Router } from 'express';
import { prisma } from '../lib/db';

const router: Router = Router();

// GET /api/price-history/:propertyId
router.get('/:propertyId', async (req, res) => {
  const history = await prisma.priceHistory.findMany({
    where: { propertyId: req.params.propertyId },
    orderBy: { createdAt: 'asc' },
  });

  const property = await prisma.property.findUnique({
    where: { id: req.params.propertyId },
    select: { currency: true },
  });

  const isCents = property?.currency === 'EUR';

  res.json({
    value: history.map((h) => ({
      ...h,
      oldPrice: isCents ? Number(h.oldPrice) / 100 : Number(h.oldPrice),
      newPrice: isCents ? Number(h.newPrice) / 100 : Number(h.newPrice),
    })),
  });
});

export default router;
