import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';

import { ensureFeaturedPackages } from './lib/seed-packages';
import { seedDatabase } from './lib/seed-db';
import authRoutes from './routes/auth';
import propertyRoutes from './routes/properties';
import userRoutes from './routes/users';
import leadRoutes from './routes/leads';
import calculationRoutes from './routes/calculations';
import simulationRoutes from './routes/simulations';
import documentRoutes from './routes/documents';
import spatialRoutes from './routes/spatial';
import activityLogRoutes from './routes/activity-logs';
import analyticsRoutes from './routes/analytics';
import webhookRoutes from './routes/webhooks';
import workflowRoutes from './routes/workflows';
import openimmoRoutes from './routes/openimmo';
import ownerRoutes from './routes/owner';
import featuredPackageRoutes from './routes/featured-packages';
import teamRoutes from './routes/teams';
import marketRoutes from './routes/market';
import valuationRoutes from './routes/valuations';
import integrationRoutes from './routes/integrations';
import importRoutes from './routes/import';
import apiKeyRoutes from './routes/api-keys';
import favoriteRoutes from './routes/favorites';
import alertRoutes from './routes/alerts';
import reviewRoutes from './routes/reviews';
import priceHistoryRoutes from './routes/price-history';
import aggregatorRoutes from './routes/aggregator';
import stripeRoutes, { stripeWebhookHandler } from './routes/stripe';
import { serializeBigIntMiddleware } from './middleware/serialize';
import { auditMiddleware } from './middleware/audit';
import { initSocket } from './lib/socket';
import path from 'path';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Initialize Socket.io
initSocket(server);

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  'http://localhost:3004',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3004',
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin?.endsWith('.up.railway.app')) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
}));
// Stripe webhook must be mounted BEFORE express.json() so it receives raw body
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);

app.use(express.json({ limit: '10mb' }));
app.use(serializeBigIntMiddleware);
app.use(auditMiddleware);

// Static files for uploads
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '0.1.0' });
});

// Routes — RESO Web API inspired structure
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/calculations', calculationRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/spatial', spatialRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/openimmo', openimmoRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/featured-packages', featuredPackageRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/valuations', valuationRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/import', importRoutes);
app.use('/api/api-keys', apiKeyRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/price-history', priceHistoryRoutes);
app.use('/api/aggregator', aggregatorRoutes);

// OData-like metadata endpoint
app.get('/api/$metadata', (_req, res) => {
  res.json({
    version: '4.0',
    entities: ['Property', 'User', 'Lead', 'Document', 'Valuation', 'ActivityLog'],
    protocol: 'REST/JSON',
    compliance: 'RESO Web API inspired',
  });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor', message: err.message });
});

server.listen(PORT, () => {
  console.log(`🚀 Portal Premium API running on http://localhost:${PORT}`);
  console.log(`📋 RESO-like metadata: http://localhost:${PORT}/api/\$metadata`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`🔌 WebSocket enabled`);
  ensureFeaturedPackages();
  seedDatabase().catch(console.error);
});
