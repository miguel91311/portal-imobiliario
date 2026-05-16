import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router: Router = Router();

function toUserResponse(user: any) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    country: user.country,
    agency: user.agency,
    licenseId: user.licenseId,
    kycStatus: user.kycStatus,
    kycRisk: user.kycRisk,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

// GET /api/users — Admin only
router.get(
  '/',
  authenticateToken,
  requireRole('admin'),
  async (req: AuthRequest, res) => {
    const { role, country, kycStatus, search } = req.query;
    
    const where: any = {};
    if (role) where.role = role;
    if (country) where.country = country;
    if (kycStatus) where.kycStatus = kycStatus;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true, email: true, name: true, role: true, country: true,
        agency: true, licenseId: true, kycStatus: true, kycRisk: true,
        isActive: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ value: users.map(toUserResponse) });
  }
);

// GET /api/users/:id
router.get(
  '/:id',
  authenticateToken,
  requireRole('admin', 'agent'),
  async (req: AuthRequest, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, email: true, name: true, role: true, country: true,
        agency: true, licenseId: true, kycStatus: true, kycRisk: true,
        isActive: true,
      },
    });
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }
    res.json(toUserResponse(user));
  }
);

// PATCH /api/users/:id/role — Admin only
router.patch(
  '/:id/role',
  authenticateToken,
  requireRole('admin'),
  async (req: AuthRequest, res) => {
    const schema = z.object({ role: z.enum(['admin', 'agent', 'owner', 'buyer']) });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Role inválida' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: result.data.role },
    });

    res.json(toUserResponse(updated));
  }
);

// PATCH /api/users/:id/status — Admin only
router.patch(
  '/:id/status',
  authenticateToken,
  requireRole('admin'),
  async (req: AuthRequest, res) => {
    const schema = z.object({ isActive: z.boolean() });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: result.data.isActive },
    });

    res.json(toUserResponse(updated));
  }
);

// PATCH /api/users/:id/kyc — Admin only
router.patch(
  '/:id/kyc',
  authenticateToken,
  requireRole('admin'),
  async (req: AuthRequest, res) => {
    const schema = z.object({
      kycStatus: z.enum(['pending', 'approved', 'rejected']),
      kycRisk: z.enum(['low', 'medium', 'high']).optional(),
    });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
    }

    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        kycStatus: result.data.kycStatus,
        ...(result.data.kycRisk && { kycRisk: result.data.kycRisk }),
      },
    });

    res.json(toUserResponse(updated));
  }
);

// POST /api/users/invite — Admin only
router.post(
  '/invite',
  authenticateToken,
  requireRole('admin'),
  async (req: AuthRequest, res) => {
    const schema = z.object({
      email: z.string().email(),
      name: z.string().min(2),
      role: z.enum(['admin', 'agent', 'owner']),
      country: z.enum(['PT', 'AO']).default('PT'),
      agency: z.string().optional(),
      licenseId: z.string().optional(),
    });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
    }

    const existing = await prisma.user.findUnique({
      where: { email: result.data.email },
    });
    if (existing) {
      return res.status(409).json({ error: 'Email já registado' });
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-10);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        email: result.data.email,
        name: result.data.name,
        passwordHash,
        role: result.data.role,
        country: result.data.country,
        agency: result.data.agency,
        licenseId: result.data.licenseId,
        kycStatus: 'pending',
      },
    });

    res.status(201).json({
      ...toUserResponse(newUser),
      tempPassword, // In production, send this via email
      message: 'Utilizador convidado com sucesso. Palavra-passe temporária gerada.',
    });
  }
);

// GET /api/users/:id/properties
router.get(
  '/:id/properties',
  authenticateToken,
  async (req: AuthRequest, res) => {
    const properties = await prisma.property.findMany({
      where: { agentId: req.params.id },
      include: { agent: { select: { id: true, name: true, agency: true } } },
    });
    res.json({ value: properties });
  }
);

export default router;
