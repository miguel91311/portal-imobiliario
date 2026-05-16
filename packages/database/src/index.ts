import { PrismaClient } from '@prisma/client';
import path from 'path';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Resolve db path relative to this file (packages/database/src/index.ts -> packages/database/prisma/dev2.db)
const dbPath = path.resolve(__dirname, '../prisma/dev2.db');
const dbUrl = 'file:' + dbPath.replace(/\\/g, '/');

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasourceUrl: dbUrl,
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export * from '@prisma/client';
