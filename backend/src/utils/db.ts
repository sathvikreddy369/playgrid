import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { StructuredLogger } from './logger';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient<Prisma.PrismaClientOptions, 'query'>({
  log: [
    { emit: 'event', level: 'query' },
  ],
  adapter,
});

prisma.$on('query', (e) => {
  if (e.duration >= 150) { // Log queries taking longer than 150ms
    StructuredLogger.warn(`Slow Query detected: ${e.duration}ms`, undefined, {
      query: e.query,
      params: e.params,
      durationMs: e.duration,
      target: e.target,
    });
  }
});

export default prisma;
