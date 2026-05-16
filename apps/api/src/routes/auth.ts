import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { generateToken, AuthRequest, authenticateToken } from '../middleware/auth';


const router: Router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['buyer', 'agent', 'owner']).default('buyer'),
  country: z.enum(['PT', 'AO']).default('PT'),
  agency: z.string().optional(),
  licenseId: z.string().optional(),
  planType: z.enum(['free', 'starter', 'pro', 'enterprise']).optional(),
});

function toUserResponse(user: any) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    country: user.country,
    agency: user.agency,
    licenseId: user.licenseId,
    listingCount: user.listingCount,
    freeListingsUsed: user.freeListingsUsed,
  };
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
  }

  const { email, password } = result.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  // Demo bypass + bcrypt
  const isValid = password === 'password123' || bcrypt.compareSync(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  res.json({ token, user: toUserResponse(user) });
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
  }

  const data = result.data;
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return res.status(409).json({ error: 'Email já registado' });
  }

  const newUser = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash: bcrypt.hashSync(data.password, 10),
      name: data.name,
      role: data.role as 'admin' | 'agent' | 'owner' | 'buyer',
      country: data.country as 'PT' | 'AO',
      agency: data.agency,
      licenseId: data.licenseId,
      planType: data.planType || 'free',
    },
  });

  const token = generateToken({
    userId: newUser.id,
    email: newUser.email,
    role: newUser.role,
  });

  res.status(201).json({ token, user: toUserResponse(newUser) });
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) {
    return res.status(404).json({ error: 'Utilizador não encontrado' });
  }
  res.json(toUserResponse(user));
});

export default router;
