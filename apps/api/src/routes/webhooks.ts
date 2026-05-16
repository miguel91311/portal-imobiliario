import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router: Router = Router();

// GET /api/webhooks
router.get(
  '/',
  authenticateToken,
  requireRole('admin'),
  async (_req, res) => {
    const webhooks = await prisma.webhook.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ value: webhooks });
  }
);

// POST /api/webhooks
const createWebhookSchema = z.object({
  name: z.string().min(2),
  url: z.string().url(),
  events: z.array(z.string()),
  secret: z.string().optional(),
});

router.post(
  '/',
  authenticateToken,
  requireRole('admin'),
  async (req: AuthRequest, res) => {
    const result = createWebhookSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
    }

    const webhook = await prisma.webhook.create({
      data: {
        name: result.data.name,
        url: result.data.url,
        events: result.data.events.join(','),
        secret: result.data.secret,
      },
    });

    res.status(201).json(webhook);
  }
);

// PATCH /api/webhooks/:id
router.patch(
  '/:id',
  authenticateToken,
  requireRole('admin'),
  async (req: AuthRequest, res) => {
    const webhook = await prisma.webhook.findUnique({ where: { id: req.params.id } });
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook não encontrado' });
    }

    const updates = req.body;
    if (updates.events && Array.isArray(updates.events)) {
      updates.events = updates.events.join(',');
    }

    const updated = await prisma.webhook.update({
      where: { id: req.params.id },
      data: updates,
    });

    res.json(updated);
  }
);

// DELETE /api/webhooks/:id
router.delete(
  '/:id',
  authenticateToken,
  requireRole('admin'),
  async (req: AuthRequest, res) => {
    await prisma.webhook.delete({ where: { id: req.params.id } });
    res.json({ message: 'Webhook eliminado' });
  }
);

export default router;
