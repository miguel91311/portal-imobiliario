import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { parseCSV, parseOpenImmo, parseJSON, scrapePropertyFromURL } from '../services/import-parsers';

const router: Router = Router();

function parsedToPrismaData(p: ReturnType<typeof parseCSV>[0], agentId: string, ownerId?: string | null) {
  const priceInCents = p.currency === 'EUR' ? Math.round(p.price * 100) : Math.round(p.price);
  return {
    title: p.title,
    description: p.description,
    price: priceInCents,
    currency: p.currency,
    address: p.address,
    city: p.city,
    country: p.country,
    neighborhood: p.neighborhood,
    latitude: p.latitude,
    longitude: p.longitude,
    typology: p.typology,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    sqm: p.sqm,
    parking: p.parking || 0,
    pool: p.pool || false,
    garden: p.garden || false,
    energyCertificate: p.energyCertificate,
    listingType: p.listingType,
    tags: p.tags && p.tags.length > 0 ? JSON.stringify(p.tags) : null,
    images: p.images.length > 0 ? JSON.stringify(p.images) : null,
    status: 'available' as const,
    externalId: p.externalId || null,
    source: p.source || null,
    agentId: ownerId ? null : agentId,
    ownerId: ownerId || null,
  };
}

// POST /api/import/csv
router.post(
  '/csv',
  authenticateToken,
  requireRole('admin', 'agent', 'owner'),
  async (req: AuthRequest, res) => {
    const schema = z.object({ content: z.string().min(1) });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
    }

    try {
      const parsed = parseCSV(result.data.content);
      const isOwner = req.user!.role === 'owner';
      const agentId = req.user!.userId;
      const ownerId = isOwner ? req.user!.userId : null;

      const data = parsed.map((p) => parsedToPrismaData(p, agentId, ownerId));

      const created = await prisma.$transaction(
        data.map((d) =>
          prisma.property.create({
            data: d,
          })
        )
      );

      res.status(201).json({
        message: `${created.length} imóveis importados com sucesso`,
        count: created.length,
        properties: created.map((c) => ({
          id: c.id,
          title: c.title,
          price: c.currency === 'EUR' ? Number(c.price) / 100 : Number(c.price),
          city: c.city,
        })),
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Erro ao processar CSV' });
    }
  }
);

// POST /api/import/openimmo
router.post(
  '/openimmo',
  authenticateToken,
  requireRole('admin', 'agent', 'owner'),
  async (req: AuthRequest, res) => {
    const schema = z.object({ content: z.string().min(1) });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
    }

    try {
      const parsed = parseOpenImmo(result.data.content);
      const isOwner = req.user!.role === 'owner';
      const agentId = req.user!.userId;
      const ownerId = isOwner ? req.user!.userId : null;

      const data = parsed.map((p) => parsedToPrismaData(p, agentId, ownerId));

      const created = await prisma.$transaction(
        data.map((d) =>
          prisma.property.create({
            data: d,
          })
        )
      );

      res.status(201).json({
        message: `${created.length} imóveis importados com sucesso (OpenImmo)`,
        count: created.length,
        properties: created.map((c) => ({
          id: c.id,
          title: c.title,
          price: c.currency === 'EUR' ? Number(c.price) / 100 : Number(c.price),
          city: c.city,
        })),
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Erro ao processar XML OpenImmo' });
    }
  }
);

// POST /api/import/json
router.post(
  '/json',
  authenticateToken,
  requireRole('admin', 'agent', 'owner'),
  async (req: AuthRequest, res) => {
    const schema = z.object({ content: z.string().min(1) });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
    }

    try {
      const parsed = parseJSON(result.data.content);
      const isOwner = req.user!.role === 'owner';
      const agentId = req.user!.userId;
      const ownerId = isOwner ? req.user!.userId : null;

      const data = parsed.map((p) => parsedToPrismaData(p, agentId, ownerId));

      const created = await prisma.$transaction(
        data.map((d) =>
          prisma.property.create({
            data: d,
          })
        )
      );

      res.status(201).json({
        message: `${created.length} imóveis importados com sucesso (JSON)`,
        count: created.length,
        properties: created.map((c) => ({
          id: c.id,
          title: c.title,
          price: c.currency === 'EUR' ? Number(c.price) / 100 : Number(c.price),
          city: c.city,
        })),
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Erro ao processar JSON' });
    }
  }
);

// POST /api/import/url
router.post(
  '/url',
  authenticateToken,
  requireRole('admin', 'agent', 'owner'),
  async (req: AuthRequest, res) => {
    const schema = z.object({ url: z.string().url() });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'URL inválido', details: result.error.flatten() });
    }

    try {
      const parsed = await scrapePropertyFromURL(result.data.url);
      const isOwner = req.user!.role === 'owner';
      const agentId = req.user!.userId;
      const ownerId = isOwner ? req.user!.userId : null;

      const data = parsedToPrismaData(parsed, agentId, ownerId);

      const created = await prisma.property.create({ data });

      res.status(201).json({
        message: 'Imóvel importado com sucesso do URL',
        property: {
          id: created.id,
          title: created.title,
          price: created.currency === 'EUR' ? Number(created.price) / 100 : Number(created.price),
          city: created.city,
        },
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Erro ao processar URL' });
    }
  }
);

// GET /api/import/preview/csv
router.post(
  '/preview/csv',
  authenticateToken,
  requireRole('admin', 'agent', 'owner'),
  async (req: AuthRequest, res) => {
    const schema = z.object({ content: z.string().min(1) });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }
    try {
      const parsed = parseCSV(result.data.content);
      res.json({ count: parsed.length, properties: parsed.slice(0, 10) });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// GET /api/import/preview/openimmo
router.post(
  '/preview/openimmo',
  authenticateToken,
  requireRole('admin', 'agent', 'owner'),
  async (req: AuthRequest, res) => {
    const schema = z.object({ content: z.string().min(1) });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }
    try {
      const parsed = parseOpenImmo(result.data.content);
      res.json({ count: parsed.length, properties: parsed.slice(0, 10) });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// GET /api/import/preview/json
router.post(
  '/preview/json',
  authenticateToken,
  requireRole('admin', 'agent', 'owner'),
  async (req: AuthRequest, res) => {
    const schema = z.object({ content: z.string().min(1) });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }
    try {
      const parsed = parseJSON(result.data.content);
      res.json({ count: parsed.length, properties: parsed.slice(0, 10) });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;
