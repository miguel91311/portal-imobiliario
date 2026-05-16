import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { upload, UPLOAD_URL_PATH } from '../middleware/upload';


const router: Router = Router();

// POST /api/documents/upload — Upload de ficheiro
router.post(
  '/upload',
  authenticateToken,
  upload.single('file'),
  async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum ficheiro enviado' });
      }

      const schema = z.object({
        propertyId: z.string().optional(),
        name: z.string().min(1),
        type: z.string().optional(),
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        // Remove uploaded file on validation error
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
      }

      const { propertyId, name, type } = result.data;

      // Verify ownership if propertyId provided
      if (propertyId) {
        const property = await prisma.property.findUnique({ where: { id: propertyId } });
        if (!property) {
          fs.unlinkSync(req.file.path);
          return res.status(404).json({ error: 'Propriedade não encontrada' });
        }
      }

      const doc = await prisma.document.create({
        data: {
          name: name || req.file.originalname,
          type: type || path.extname(req.file.originalname).toUpperCase().replace('.', ''),
          url: `${UPLOAD_URL_PATH}/${path.basename(req.file.path)}`,
          size: BigInt(req.file.size),
          status: 'pending',
          propertyId: propertyId || null,
          ownerId: req.user!.userId,
        },
      });

      res.status(201).json({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        url: doc.url,
        size: Number(doc.size),
        status: doc.status,
        createdAt: doc.createdAt,
      });
    } catch (err: any) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: 'Erro ao processar upload', message: err.message });
    }
  }
);

// GET /api/documents — Listar documentos do utilizador
router.get(
  '/',
  authenticateToken,
  async (req: AuthRequest, res) => {
    const where: any = {};

    if (req.query.propertyId) where.propertyId = req.query.propertyId;
    if (req.query.ownerId && req.user!.role === 'admin') {
      where.ownerId = req.query.ownerId;
    } else {
      where.ownerId = req.user!.userId;
    }

    const documents = await prisma.document.findMany({
      where,
      include: { property: { select: { title: true, id: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      value: documents.map((d) => ({
        ...d,
        size: Number(d.size),
      })),
    });
  }
);

// GET /api/documents/:id/download — Download direto
router.get('/:id/download', authenticateToken, async (req: AuthRequest, res) => {
  const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!doc) {
    return res.status(404).json({ error: 'Documento não encontrado' });
  }

  // Authorization check
  if (doc.ownerId !== req.user!.userId && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Não autorizado' });
  }

  const filePath = path.resolve(__dirname, '../../', doc.url.replace('/uploads/', 'uploads/'));
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Ficheiro não encontrado no disco' });
  }

  res.download(filePath, doc.name + '.' + doc.type.toLowerCase());
});

// DELETE /api/documents/:id
router.delete(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res) => {
    const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
    if (!doc) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    if (doc.ownerId !== req.user!.userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Não autorizado' });
    }

    // Remove file from disk
    const filePath = path.resolve(__dirname, '../../', doc.url.replace('/uploads/', 'uploads/'));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.document.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  }
);

export default router;
