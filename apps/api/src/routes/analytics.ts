import { Router } from 'express';
import { prisma } from '../lib/db';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router: Router = Router();

// GET /api/analytics/overview — Admin & Agent
router.get(
  '/overview',
  authenticateToken,
  requireRole('admin', 'agent'),
  async (req: AuthRequest, res) => {
    const countryFilter = req.query.country as string | undefined;
    const agentFilter = req.user!.role === 'agent' ? req.user!.userId : undefined;

    const whereProperty: any = {};
    const whereLead: any = {};
    const whereSimulation: any = {};

    if (countryFilter) {
      whereProperty.country = countryFilter;
    }
    if (agentFilter) {
      whereProperty.agentId = agentFilter;
      whereLead.agentId = agentFilter;
    }

    const [
      totalProperties,
      totalLeads,
      totalSimulations,
      totalUsers,
      activeProperties,
      soldProperties,
      recentLeads,
      recentSimulations,
    ] = await Promise.all([
      prisma.property.count({ where: whereProperty }),
      prisma.lead.count({ where: whereLead }),
      prisma.simulation.count({ where: whereSimulation }),
      prisma.user.count(),
      prisma.property.count({ where: { ...whereProperty, status: 'available' } }),
      prisma.property.count({ where: { ...whereProperty, status: 'sold' } }),
      prisma.lead.count({
        where: {
          ...whereLead,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.simulation.count({
        where: {
          ...whereSimulation,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    res.json({
      totalProperties,
      totalLeads,
      totalSimulations,
      totalUsers,
      activeProperties,
      soldProperties,
      recentLeads,
      recentSimulations,
      conversionRate: totalSimulations > 0 ? Math.round((totalLeads / totalSimulations) * 100) : 0,
    });
  }
);

// GET /api/analytics/leads-by-status
router.get(
  '/leads-by-status',
  authenticateToken,
  requireRole('admin', 'agent'),
  async (req: AuthRequest, res) => {
    const agentFilter = req.user!.role === 'agent' ? req.user!.userId : undefined;
    const where: any = {};
    if (agentFilter) where.agentId = agentFilter;

    const leads = await prisma.lead.groupBy({
      by: ['status'],
      where,
      _count: { id: true },
    });

    res.json({
      value: leads.map((l) => ({ status: l.status, count: l._count.id })),
    });
  }
);

// GET /api/analytics/properties-by-month
router.get(
  '/properties-by-month',
  authenticateToken,
  requireRole('admin'),
  async (_req, res) => {
    // SQLite doesn't support date_trunc, so we do it in JS
    const properties = await prisma.property.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const byMonth: Record<string, number> = {};
    properties.forEach((p) => {
      const month = p.createdAt.toISOString().slice(0, 7); // YYYY-MM
      byMonth[month] = (byMonth[month] || 0) + 1;
    });

    res.json({
      value: Object.entries(byMonth).map(([month, count]) => ({ month, count })),
    });
  }
);

// GET /api/analytics/top-agents
router.get(
  '/top-agents',
  authenticateToken,
  requireRole('admin'),
  async (_req, res) => {
    const agents = await prisma.user.findMany({
      where: { role: 'agent' },
      select: {
        id: true,
        name: true,
        agency: true,
        _count: {
          select: { properties: true, leads: true },
        },
      },
      orderBy: { leads: { _count: 'desc' } },
      take: 10,
    });

    res.json({
      value: agents.map((a) => ({
        id: a.id,
        name: a.name,
        agency: a.agency,
        propertiesCount: a._count.properties,
        leadsCount: a._count.leads,
      })),
    });
  }
);

// GET /api/analytics/alerts — Anomaly detection
router.get(
  '/alerts',
  authenticateToken,
  requireRole('admin', 'agent'),
  async (req: AuthRequest, res) => {
    const agentFilter = req.user!.role === 'agent' ? req.user!.userId : undefined;

    // Fetch all properties with their metrics
    const properties = await prisma.property.findMany({
      where: agentFilter ? { agentId: agentFilter } : {},
      select: {
        id: true, title: true, price: true, currency: true,
        city: true, country: true, viewCount: true, contactCount: true,
        status: true, sqm: true, createdAt: true,
      },
    });

    // Calculate average price per sqm by city
    const cityStats: Record<string, { totalPrice: number; totalSqm: number; count: number }> = {};
    properties.forEach((p) => {
      if (!cityStats[p.city]) cityStats[p.city] = { totalPrice: 0, totalSqm: 0, count: 0 };
      const price = p.currency === 'EUR' ? Number(p.price) / 100 : Number(p.price);
      cityStats[p.city].totalPrice += price;
      cityStats[p.city].totalSqm += p.sqm;
      cityStats[p.city].count += 1;
    });

    const cityAverages: Record<string, number> = {};
    Object.entries(cityStats).forEach(([city, stats]) => {
      cityAverages[city] = stats.totalSqm > 0 ? stats.totalPrice / stats.totalSqm : 0;
    });

    const alerts: any[] = [];

    properties.forEach((p) => {
      const price = p.currency === 'EUR' ? Number(p.price) / 100 : Number(p.price);
      const pricePerSqm = p.sqm > 0 ? price / p.sqm : 0;
      const cityAvg = cityAverages[p.city] || 0;

      // Alert: High views, zero contacts → price too high
      if (p.viewCount > 50 && p.contactCount === 0) {
        alerts.push({
          type: 'price_too_high',
          severity: 'high',
          propertyId: p.id,
          propertyTitle: p.title,
          city: p.city,
          message: `${p.viewCount} visualizações, 0 contactos — preço possivelmente alto`,
          suggestion: 'Considerar redução de preço ou melhoria da apresentação',
        });
      }

      // Alert: Price 20% below city average → arbitrage opportunity
      if (cityAvg > 0 && pricePerSqm < cityAvg * 0.8) {
        alerts.push({
          type: 'arbitrage_opportunity',
          severity: 'medium',
          propertyId: p.id,
          propertyTitle: p.title,
          city: p.city,
          message: `Preço ${Math.round((1 - pricePerSqm / cityAvg) * 100)}% abaixo da média da zona`,
          suggestion: 'Oportunidade de arbitragem — preço competitivo',
        });
      }

      // Alert: Price 50% above city average → may be overpriced
      if (cityAvg > 0 && pricePerSqm > cityAvg * 1.5) {
        alerts.push({
          type: 'overpriced',
          severity: 'medium',
          propertyId: p.id,
          propertyTitle: p.title,
          city: p.city,
          message: `Preço ${Math.round((pricePerSqm / cityAvg - 1) * 100)}% acima da média da zona`,
          suggestion: 'Verificar justificação do preço premium',
        });
      }

      // Alert: Property listed for too long without contacts
      const daysListed = Math.floor((Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      if (daysListed > 30 && p.contactCount < 3 && p.status === 'available') {
        alerts.push({
          type: 'stale_listing',
          severity: 'low',
          propertyId: p.id,
          propertyTitle: p.title,
          city: p.city,
          message: `Anunciado há ${daysListed} dias com apenas ${p.contactCount} contactos`,
          suggestion: 'Reavaliar preço ou estratégia de marketing',
        });
      }
    });

    res.json({ value: alerts });
  }
);

export default router;
