import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router: Router = Router();

const createSchema = z.object({
  type: z.enum(['imt-jovem', 'ipu-angola', 'avm']),
  inputData: z.record(z.any()),
  resultData: z.record(z.any()),
  propertyId: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
});

// POST /api/simulations — guarda uma simulação e converte em lead se houver contacto
router.post('/', async (req, res) => {
  const result = createSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: result.error.flatten() });
  }

  const data = result.data;

  // Guardar simulação
  const simulation = await prisma.simulation.create({
    data: {
      type: data.type,
      inputData: JSON.stringify(data.inputData),
      resultData: JSON.stringify(data.resultData),
      propertyId: data.propertyId,
      email: data.email,
      phone: data.phone,
      name: data.name,
    },
  });

  // Se houver email e propertyId, criar lead automaticamente
  let lead = null;
  if (data.email && data.propertyId) {
    const property = await prisma.property.findUnique({ where: { id: data.propertyId } });
    if (property) {
      lead = await prisma.lead.create({
        data: {
          name: data.name || 'Simulador Web',
          email: data.email,
          phone: data.phone,
          propertyId: data.propertyId,
          agentId: property.agentId,
          score: 75, // Simuladores indicam intenção de compra alta
          status: 'warm',
          source: 'organic',
          notes: `Lead gerado via simulação ${data.type}. Valor: ${data.inputData.propertyValue || 'N/A'}`,
        },
      });

      await prisma.simulation.update({
        where: { id: simulation.id },
        data: { converted: true },
      });
    }
  }

  res.status(201).json({ simulation, lead });
});

// GET /api/simulations — Admin/Agent only
router.get(
  '/',
  authenticateToken,
  requireRole('admin', 'agent'),
  async (req: AuthRequest, res) => {
    const where: any = {};
    if (req.query.type) where.type = req.query.type;
    if (req.query.propertyId) where.propertyId = req.query.propertyId;

    const simulations = await prisma.simulation.findMany({
      where,
      include: { property: { select: { title: true, id: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json({
      value: simulations.map((s) => ({
        ...s,
        inputData: JSON.parse(s.inputData),
        resultData: JSON.parse(s.resultData),
      })),
    });
  }
);

export default router;
