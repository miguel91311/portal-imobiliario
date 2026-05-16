import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router: Router = Router();

// GET /api/workflows
router.get(
  '/',
  authenticateToken,
  requireRole('admin'),
  async (_req, res) => {
    const workflows = await prisma.workflow.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ value: workflows });
  }
);

// POST /api/workflows
const createWorkflowSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  trigger: z.string(),
  actions: z.array(z.object({
    type: z.string(),
    config: z.record(z.any()),
  })),
});

router.post(
  '/',
  authenticateToken,
  requireRole('admin'),
  async (req: AuthRequest, res) => {
    const result = createWorkflowSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
    }

    const workflow = await prisma.workflow.create({
      data: {
        name: result.data.name,
        description: result.data.description,
        trigger: result.data.trigger,
        actions: JSON.stringify(result.data.actions),
      },
    });

    res.status(201).json(workflow);
  }
);

// PATCH /api/workflows/:id
router.patch(
  '/:id',
  authenticateToken,
  requireRole('admin'),
  async (req: AuthRequest, res) => {
    const workflow = await prisma.workflow.findUnique({ where: { id: req.params.id } });
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow não encontrado' });
    }

    const updates = req.body;
    if (updates.actions && Array.isArray(updates.actions)) {
      updates.actions = JSON.stringify(updates.actions);
    }

    const updated = await prisma.workflow.update({
      where: { id: req.params.id },
      data: updates,
    });

    res.json(updated);
  }
);

// DELETE /api/workflows/:id
router.delete(
  '/:id',
  authenticateToken,
  requireRole('admin'),
  async (req: AuthRequest, res) => {
    await prisma.workflow.delete({ where: { id: req.params.id } });
    res.json({ message: 'Workflow eliminado' });
  }
);

export default router;
