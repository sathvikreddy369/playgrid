import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Diagnostic check for Supabase IPv6 direct URL vs IPv4 pooler URL on Render
if (process.env.DATABASE_URL?.includes('db.') && process.env.DATABASE_URL?.includes('.supabase.co')) {
  console.warn(
    '⚠️ [DATABASE WARNING] DATABASE_URL appears to be using Supabase direct host (db.[ref].supabase.co). ' +
    'Render free tier uses IPv4 networking. If connections fail with P1001, update DATABASE_URL in Render settings to your Supabase IPv4 Pooler URL (e.g., aws-0-[region].pooler.supabase.com:6543).'
  );
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
