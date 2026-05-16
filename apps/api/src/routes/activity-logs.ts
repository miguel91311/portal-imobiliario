import { Router } from 'express';
import { prisma } from '../lib/db';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router: Router = Router();

// GET /api/activity-logs — Admin only
router.get(
  '/',
  authenticateToken,
  requireRole('admin'),
  async (req: AuthRequest, res) => {
    const { userId, action, page = '1', limit = '50' } = req.query;
    
    const where: any = {};
    if (userId) where.userId = userId as string;
    if (action) where.action = { contains: action as string, mode: 'insensitive' };

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.activityLog.count({ where }),
    ]);

    res.json({
      value: logs,
      '@odata.count': total,
      page: parseInt(page as string),
      limit: take,
    });
  }
);

export default router;
