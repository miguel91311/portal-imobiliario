import { Router } from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/db';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router: Router = Router();

function generateApiKey(): string {
  return 'pp_' + crypto.randomBytes(32).toString('hex');
}

// GET /api/api-keys — listar chaves do utilizador
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  const keys = await prisma.apiKey.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(keys.map((k) => ({
    id: k.id,
    name: k.name,
    key: k.key.slice(0, 12) + '...' + k.key.slice(-4),
    fullKey: k.key,
    isActive: k.isActive,
    lastUsedAt: k.lastUsedAt,
    expiresAt: k.expiresAt,
    createdAt: k.createdAt,
  })));
});

// POST /api/api-keys — criar nova chave
router.post('/', authenticateToken, requireRole('admin', 'agent'), async (req: AuthRequest, res) => {
  const { name, expiresInDays } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Nome da chave é obrigatório' });
  }

  const key = generateApiKey();
  const expiresAt = expiresInDays && Number(expiresInDays) > 0
    ? new Date(Date.now() + Number(expiresInDays) * 24 * 60 * 60 * 1000)
    : null;

  const apiKey = await prisma.apiKey.create({
    data: {
      name,
      key,
      userId: req.user!.userId,
      expiresAt,
    },
  });

  res.status(201).json({
    id: apiKey.id,
    name: apiKey.name,
    key: apiKey.key,
    isActive: apiKey.isActive,
    expiresAt: apiKey.expiresAt,
    createdAt: apiKey.createdAt,
  });
});

// DELETE /api/api-keys/:id — revogar chave
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  const apiKey = await prisma.apiKey.findUnique({ where: { id: req.params.id } });
  if (!apiKey) {
    return res.status(404).json({ error: 'Chave não encontrada' });
  }
  if (apiKey.userId !== req.user!.userId && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Não podes revogar esta chave' });
  }

  await prisma.apiKey.delete({ where: { id: req.params.id } });
  res.json({ message: 'Chave revogada com sucesso' });
});

// Middleware para autenticar via API Key (usado em routes externas)
export async function authenticateApiKey(req: any, res: any, next: any) {
  const apiKeyHeader = req.headers['x-api-key'] || req.query.apiKey;
  if (!apiKeyHeader) {
    return next();
  }

  const apiKey = await prisma.apiKey.findUnique({
    where: { key: String(apiKeyHeader) },
    include: { user: true },
  });

  if (!apiKey || !apiKey.isActive) {
    return res.status(401).json({ error: 'API Key inválida' });
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return res.status(401).json({ error: 'API Key expirada' });
  }

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  req.user = {
    userId: apiKey.user.id,
    email: apiKey.user.email,
    role: apiKey.user.role,
  };
  next();
}

export default router;
