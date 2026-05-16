import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router: Router = Router();

// Helper: get user's team membership
async function getUserTeam(userId: string) {
  const member = await prisma.teamMember.findFirst({
    where: { userId },
    include: { team: true },
  });
  return member;
}

// POST /api/teams — Create team
router.post(
  '/',
  authenticateToken,
  requireRole('admin', 'agent', 'owner'),
  async (req: AuthRequest, res) => {
    const schema = z.object({
      name: z.string().min(2),
      slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
      description: z.string().optional(),
      country: z.enum(['PT', 'AO']).default('PT'),
    });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
    }

    // Check if user already has a team
    const existingMember = await prisma.teamMember.findFirst({
      where: { userId: req.user!.userId },
    });
    if (existingMember) {
      return res.status(409).json({ error: 'Já pertence a uma equipa' });
    }

    // Check slug uniqueness
    const existingSlug = await prisma.team.findUnique({ where: { slug: result.data.slug } });
    if (existingSlug) {
      return res.status(409).json({ error: 'Slug já em uso' });
    }

    const team = await prisma.team.create({
      data: {
        name: result.data.name,
        slug: result.data.slug,
        description: result.data.description,
        country: result.data.country,
        brokerId: req.user!.userId,
      },
    });

    // Add creator as broker member
    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: req.user!.userId,
        role: 'broker',
        commissionRate: 100,
      },
    });

    res.status(201).json(team);
  }
);

// GET /api/teams — List my teams
router.get(
  '/',
  authenticateToken,
  async (req: AuthRequest, res) => {
    const memberships = await prisma.teamMember.findMany({
      where: { userId: req.user!.userId },
      include: {
        team: {
          include: {
            broker: { select: { id: true, name: true, email: true } },
            _count: { select: { members: true, properties: true, leads: true } },
          },
        },
      },
    });
    res.json({ value: memberships.map((m) => ({ ...m.team, myRole: m.role })) });
  }
);

// GET /api/teams/:id
router.get(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res) => {
    const membership = await prisma.teamMember.findFirst({
      where: { teamId: req.params.id, userId: req.user!.userId },
    });
    if (!membership) {
      return res.status(403).json({ error: 'Não é membro desta equipa' });
    }

    const team = await prisma.team.findUnique({
      where: { id: req.params.id },
      include: {
        broker: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, properties: true, leads: true } },
      },
    });
    if (!team) {
      return res.status(404).json({ error: 'Equipa não encontrada' });
    }

    res.json({ ...team, myRole: membership.role });
  }
);

// PATCH /api/teams/:id — Update team (broker only)
router.patch(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res) => {
    const membership = await prisma.teamMember.findFirst({
      where: { teamId: req.params.id, userId: req.user!.userId, role: 'broker' },
    });
    if (!membership) {
      return res.status(403).json({ error: 'Apenas o broker pode editar a equipa' });
    }

    const schema = z.object({
      name: z.string().min(2).optional(),
      description: z.string().optional(),
      logoUrl: z.string().optional(),
    });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    const updated = await prisma.team.update({
      where: { id: req.params.id },
      data: result.data,
    });

    res.json(updated);
  }
);

// POST /api/teams/:id/invite — Invite member (broker only)
router.post(
  '/:id/invite',
  authenticateToken,
  async (req: AuthRequest, res) => {
    const membership = await prisma.teamMember.findFirst({
      where: { teamId: req.params.id, userId: req.user!.userId, role: 'broker' },
    });
    if (!membership) {
      return res.status(403).json({ error: 'Apenas o broker pode convidar membros' });
    }

    const schema = z.object({
      email: z.string().email(),
      name: z.string().min(2),
      role: z.enum(['agent', 'assistant']).default('agent'),
      commissionRate: z.number().min(0).max(100).default(50),
    });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
    }

    const data = result.data;

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      const tempPassword = Math.random().toString(36).slice(-10);
      user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          passwordHash: bcrypt.hashSync(tempPassword, 10),
          role: 'agent',
          country: 'PT',
        },
      });
    }

    // Check if already in team
    const existing = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: req.params.id, userId: user.id } },
    });
    if (existing) {
      return res.status(409).json({ error: 'Utilizador já é membro desta equipa' });
    }

    const member = await prisma.teamMember.create({
      data: {
        teamId: req.params.id,
        userId: user.id,
        role: data.role,
        commissionRate: data.commissionRate,
      },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });

    res.status(201).json(member);
  }
);

// GET /api/teams/:id/members
router.get(
  '/:id/members',
  authenticateToken,
  async (req: AuthRequest, res) => {
    const membership = await prisma.teamMember.findFirst({
      where: { teamId: req.params.id, userId: req.user!.userId },
    });
    if (!membership) {
      return res.status(403).json({ error: 'Não é membro desta equipa' });
    }

    const members = await prisma.teamMember.findMany({
      where: { teamId: req.params.id },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      orderBy: { joinedAt: 'asc' },
    });

    res.json({ value: members });
  }
);

// PATCH /api/teams/:id/members/:userId — Update member (broker only)
router.patch(
  '/:id/members/:userId',
  authenticateToken,
  async (req: AuthRequest, res) => {
    const membership = await prisma.teamMember.findFirst({
      where: { teamId: req.params.id, userId: req.user!.userId, role: 'broker' },
    });
    if (!membership) {
      return res.status(403).json({ error: 'Apenas o broker pode editar membros' });
    }

    // Cannot edit self through this endpoint
    if (req.params.userId === req.user!.userId) {
      return res.status(400).json({ error: 'Use as definições da equipa para editar o seu próprio perfil' });
    }

    const schema = z.object({
      role: z.enum(['agent', 'assistant']).optional(),
      commissionRate: z.number().min(0).max(100).optional(),
    });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    const updated = await prisma.teamMember.update({
      where: { teamId_userId: { teamId: req.params.id, userId: req.params.userId } },
      data: result.data,
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.json(updated);
  }
);

// DELETE /api/teams/:id/members/:userId — Remove member (broker only)
router.delete(
  '/:id/members/:userId',
  authenticateToken,
  async (req: AuthRequest, res) => {
    const membership = await prisma.teamMember.findFirst({
      where: { teamId: req.params.id, userId: req.user!.userId, role: 'broker' },
    });
    if (!membership) {
      return res.status(403).json({ error: 'Apenas o broker pode remover membros' });
    }

    if (req.params.userId === req.user!.userId) {
      return res.status(400).json({ error: 'Não pode remover-se a si próprio' });
    }

    await prisma.teamMember.delete({
      where: { teamId_userId: { teamId: req.params.id, userId: req.params.userId } },
    });

    res.json({ message: 'Membro removido com sucesso' });
  }
);

// GET /api/teams/:id/stats
router.get(
  '/:id/stats',
  authenticateToken,
  async (req: AuthRequest, res) => {
    const membership = await prisma.teamMember.findFirst({
      where: { teamId: req.params.id, userId: req.user!.userId },
    });
    if (!membership) {
      return res.status(403).json({ error: 'Não é membro desta equipa' });
    }

    const [totalLeads, totalProperties, leadsByStatus, closedWon, closedLost] = await Promise.all([
      prisma.lead.count({ where: { teamId: req.params.id } }),
      prisma.property.count({ where: { teamId: req.params.id } }),
      prisma.lead.groupBy({ by: ['status'], where: { teamId: req.params.id }, _count: { status: true } }),
      prisma.lead.count({ where: { teamId: req.params.id, status: 'closed_won' } }),
      prisma.lead.count({ where: { teamId: req.params.id, status: 'closed_lost' } }),
    ]);

    const conversionRate = totalLeads > 0 ? Math.round((closedWon / totalLeads) * 100) : 0;

    res.json({
      totalLeads,
      totalProperties,
      closedWon,
      closedLost,
      conversionRate,
      leadsByStatus: leadsByStatus.reduce((acc: any, s) => {
        acc[s.status] = s._count.status;
        return acc;
      }, {}),
    });
  }
);

export { getUserTeam };
export default router;
