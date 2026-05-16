import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { prisma } from '../lib/db';

const router: Router = Router();

// Supported portals for outbound syndication
const PORTALS = ['olx', 'imovirtual', 'custojusto', 'facebook'] as const;

// GET /api/integrations — List configured portals
router.get(
  '/',
  authenticateToken,
  requireRole('admin', 'agent'),
  async (req: AuthRequest, res) => {
    const configs = await prisma.workflow.findMany({
      where: { trigger: 'integration.config' },
    });
    res.json({
      value: PORTALS.map((portal) => ({
        portal,
        name: portal.toUpperCase(),
        configured: configs.some((c) => c.name === portal),
        url: `https://${portal}.pt`,
      })),
    });
  }
);

// POST /api/integrations/:portal/publish — Publish property to external portal
router.post(
  '/:portal/publish',
  authenticateToken,
  requireRole('admin', 'agent'),
  async (req: AuthRequest, res) => {
    const schema = z.object({ propertyId: z.string() });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    const portal = req.params.portal;
    if (!PORTALS.includes(portal as any)) {
      return res.status(400).json({ error: 'Portal não suportado' });
    }

    const property = await prisma.property.findUnique({
      where: { id: result.data.propertyId },
    });
    if (!property) {
      return res.status(404).json({ error: 'Propriedade não encontrada' });
    }

    // In production, this would call the actual portal API
    // For demo, we simulate success
    const mockResponse = {
      portal,
      propertyId: property.id,
      status: 'published',
      externalUrl: `https://${portal}.pt/anuncio/${property.id}`,
      publishedAt: new Date().toISOString(),
      message: 'Anúncio publicado com sucesso (simulação)',
    };

    res.json(mockResponse);
  }
);

// POST /api/integrations/:portal/unpublish
router.post(
  '/:portal/unpublish',
  authenticateToken,
  requireRole('admin', 'agent'),
  async (req: AuthRequest, res) => {
    const schema = z.object({ propertyId: z.string() });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    const portal = req.params.portal;
    if (!PORTALS.includes(portal as any)) {
      return res.status(400).json({ error: 'Portal não suportado' });
    }

    res.json({
      portal,
      propertyId: result.data.propertyId,
      status: 'unpublished',
      message: 'Anúncio removido (simulação)',
    });
  }
);

export default router;
