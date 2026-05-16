import { Response } from 'express';
import { prisma } from '../lib/db';
import { AuthRequest } from './auth';

/**
 * Audit middleware — logs write operations to ActivityLog
 * Usage: app.use(auditMiddleware) after auth routes but before other routes
 */
export function auditMiddleware(req: AuthRequest, res: Response, next: Function) {
  // Only audit write operations
  const methodsToAudit = ['POST', 'PATCH', 'PUT', 'DELETE'];
  if (!methodsToAudit.includes(req.method)) {
    return next();
  }

  // Capture the original json method
  const originalJson = res.json.bind(res);
  let responseBody: any = null;

  res.json = function(body: any) {
    responseBody = body;
    return originalJson(body);
  };

  // After response is sent, log the activity
  res.on('finish', async () => {
    try {
      const userId = req.user?.userId || null;
      const ipAddress = req.ip || req.socket.remoteAddress || null;
      
      // Determine action description
      let action = `${req.method} ${req.path}`;
      let target = req.params.id || req.params.propertyId || req.params.userId || null;
      let details = '';

      // Extract meaningful details from request body
      if (req.body) {
        const bodyKeys = Object.keys(req.body);
        if (bodyKeys.length > 0) {
          details = `Campos alterados: ${bodyKeys.join(', ')}`;
        }
      }

      // Specific action descriptions
      if (req.path.includes('/users') && req.method === 'PATCH') {
        if (req.body.role) action = `ALTERAÇÃO_DE_ROLE`;
        else if (req.body.kycStatus) action = `ALTERAÇÃO_KYC`;
        else if (req.body.isActive !== undefined) action = req.body.isActive ? `ATIVAÇÃO_CONTA` : `DESATIVAÇÃO_CONTA`;
        else action = `EDIÇÃO_UTILIZADOR`;
      } else if (req.path.includes('/properties') && req.method === 'POST') {
        action = `CRIAÇÃO_IMÓVEL`;
      } else if (req.path.includes('/properties') && req.method === 'PATCH') {
        action = `EDIÇÃO_IMÓVEL`;
        if (req.body.price) details = `Preço alterado para ${req.body.price}`;
      } else if (req.path.includes('/leads') && req.method === 'PATCH') {
        action = `ATUALIZAÇÃO_LEAD`;
        if (req.body.status) details = `Status alterado para ${req.body.status}`;
      } else if (req.path.includes('/documents') && req.method === 'POST') {
        action = `UPLOAD_DOCUMENTO`;
      } else if (req.path.includes('/documents') && req.method === 'DELETE') {
        action = `ELIMINAÇÃO_DOCUMENTO`;
      }

      await prisma.activityLog.create({
        data: {
          action,
          target: target || req.path,
          details: details || undefined,
          ipAddress: ipAddress || undefined,
          userId: userId || undefined,
        },
      });
    } catch (err) {
      // Silently fail — audit logging should not break the API
      console.error('Audit logging failed:', err);
    }
  });

  next();
}
