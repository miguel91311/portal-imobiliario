import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { getUserTeam } from './teams';

const router: Router = Router();

const PIPELINE_STATUSES = [
  'new', 'qualified', 'visit_scheduled', 'proposal_sent',
  'reserved', 'closed_won', 'closed_lost'
] as const;

// GET /api/leads
router.get(
  '/',
  authenticateToken,
  requireRole('admin', 'agent'),
  async (req: AuthRequest, res) => {
    const where: any = {};

    if (req.user!.role === 'agent') {
      const team = await getUserTeam(req.user!.userId);
      if (team) {
        where.OR = [{ agentId: req.user!.userId }, { teamId: team.teamId }];
      } else {
        where.agentId = req.user!.userId;
      }
    }
    if (req.query.status) where.status = req.query.status;
    if (req.query.propertyId) where.propertyId = req.query.propertyId;

    const leads = await prisma.lead.findMany({
      where,
      include: {
        property: { select: { title: true, id: true, price: true, currency: true, city: true } },
        agent: { select: { id: true, name: true } },
      },
      orderBy: { score: 'desc' },
    });

    res.json({ value: leads });
  }
);

// GET /api/leads/:id/360 — Full client history
router.get(
  '/:id/360',
  authenticateToken,
  requireRole('admin', 'agent'),
  async (req: AuthRequest, res) => {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      include: {
        property: {
          select: {
            id: true, title: true, price: true, currency: true,
            city: true, country: true, images: true,
          },
        },
        agent: { select: { id: true, name: true, email: true } },
      },
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }

    if (req.user!.role === 'agent' && lead.agentId !== req.user!.userId) {
      const team = await getUserTeam(req.user!.userId);
      if (!team || lead.teamId !== team.teamId) {
        return res.status(403).json({ error: 'Não autorizado' });
      }
    }

    // Fetch related data for 360 view
    const [simulations, documents, otherLeads] = await Promise.all([
      prisma.simulation.findMany({
        where: { email: lead.email },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.document.findMany({
        where: { ownerId: lead.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.lead.findMany({
        where: { email: lead.email, id: { not: lead.id } },
        include: { property: { select: { title: true, city: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.json({
      lead,
      simulations,
      documents,
      otherLeads,
    });
  }
);

// POST /api/leads
const createLeadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  propertyId: z.string(),
  source: z.enum(['organic', 'paid', 'referral', 'direct']).default('organic'),
  notes: z.string().optional(),
});

router.post('/', async (req, res) => {
  const result = createLeadSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
  }

  const property = await prisma.property.findUnique({ where: { id: result.data.propertyId } });
  if (!property) {
    return res.status(404).json({ error: 'Propriedade não encontrada' });
  }

  const newLead = await prisma.lead.create({
    data: {
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone,
      propertyId: result.data.propertyId,
      agentId: property.agentId,
      teamId: property.teamId,
      score: Math.floor(Math.random() * 40) + 50,
      status: 'new',
      source: result.data.source as 'organic' | 'paid' | 'referral' | 'direct',
      notes: result.data.notes,
    },
  });

  await prisma.property.update({
    where: { id: result.data.propertyId },
    data: { contactCount: { increment: 1 } },
  });

  res.status(201).json(newLead);
});

// PATCH /api/leads/:id — Update lead (status, score, notes)
router.patch(
  '/:id',
  authenticateToken,
  requireRole('admin', 'agent'),
  async (req: AuthRequest, res) => {
    const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!lead) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }

    if (req.user!.role === 'agent' && lead.agentId !== req.user!.userId) {
      const team = await getUserTeam(req.user!.userId);
      if (!team || lead.teamId !== team.teamId) {
        return res.status(403).json({ error: 'Não autorizado' });
      }
    }

    const updated = await prisma.lead.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(updated);
  }
);

// POST /api/leads/:id/score — Recalculate lead score
router.post(
  '/:id/score',
  authenticateToken,
  requireRole('admin', 'agent'),
  async (req: AuthRequest, res) => {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      include: { property: { select: { viewCount: true, contactCount: true } } },
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }

    if (req.user!.role === 'agent' && lead.agentId !== req.user!.userId) {
      const team = await getUserTeam(req.user!.userId);
      if (!team || lead.teamId !== team.teamId) {
        return res.status(403).json({ error: 'Não autorizado' });
      }
    }

    // Heuristic scoring algorithm (0-100)
    let score = 30; // Base score

    // Source quality
    if (lead.source === 'referral') score += 20;
    else if (lead.source === 'paid') score += 15;
    else if (lead.source === 'direct') score += 10;

    // Has phone
    if (lead.phone) score += 10;

    // Has notes (engaged)
    if (lead.notes && lead.notes.length > 10) score += 10;

    // Property interest level (view count)
    if (lead.property && lead.property.viewCount > 50) score += 10;
    if (lead.property && lead.property.contactCount > 5) score += 10;

    // Status progression
    const statusScores: Record<string, number> = {
      new: 0, qualified: 5, visit_scheduled: 15,
      proposal_sent: 20, reserved: 25, closed_won: 30, closed_lost: 0,
    };
    score += statusScores[lead.status] || 0;

    // Cap at 100
    score = Math.min(100, Math.max(0, score));

    const updated = await prisma.lead.update({
      where: { id: req.params.id },
      data: { score },
    });

    res.json({ ...updated, scoringBreakdown: {
      base: 30, source: lead.source, phone: lead.phone ? 10 : 0,
      notes: lead.notes ? 10 : 0, status: statusScores[lead.status] || 0, total: score,
    }});
  }
);

// PATCH /api/leads/:id/status — Move to next/prev pipeline stage
router.patch(
  '/:id/status',
  authenticateToken,
  requireRole('admin', 'agent'),
  async (req: AuthRequest, res) => {
    const schema = z.object({ status: z.enum(PIPELINE_STATUSES) });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Status inválido', validStatuses: PIPELINE_STATUSES });
    }

    const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!lead) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }

    if (req.user!.role === 'agent' && lead.agentId !== req.user!.userId) {
      const team = await getUserTeam(req.user!.userId);
      if (!team || lead.teamId !== team.teamId) {
        return res.status(403).json({ error: 'Não autorizado' });
      }
    }

    const updated = await prisma.lead.update({
      where: { id: req.params.id },
      data: { status: result.data.status },
    });

    res.json(updated);
  }
);

export default router;
