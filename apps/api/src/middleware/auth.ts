import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';
import { prisma } from '../lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'portal-premium-dev-secret-2026';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    const user = await prisma.user.findUnique({ where: { id: decoded.userId }, select: { isActive: true } });
    if (!user || !user.isActive) {
      return res.status(403).json({ error: 'Conta desativada. Contacte o administrador.' });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permissão insuficiente' });
    }
    next();
  };
}

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}
