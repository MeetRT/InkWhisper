/**
 * server.js — InkWhisper backend entry point
 *
 * Stack: Fastify 5 + Pino logging + Prisma/SQLite
 *
 * Registers:
 *   - CORS (configurable via env)
 *   - Public routes  (/nodes, /nodes/:id)
 *   - Admin routes   (/admin/nodes)
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import publicRoutes from './routes/publicRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import prisma from './db.js';

// ─── Configuration ────────────────────────────────────────────────────────────

const PORT = Number(process.env.PORT ?? 3001);
const HOST = process.env.HOST ?? '127.0.0.1';

const rawOrigins = process.env.CORS_ORIGINS ?? 'http://localhost:5173';
const corsOrigins = rawOrigins.split(',').map((o) => o.trim());

// ─── Server instantiation ─────────────────────────────────────────────────────

const fastify = Fastify({
  logger: {
    transport:
      process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:HH:MM:ss.l',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
    level: process.env.LOG_LEVEL ?? 'info',
  },
});

// ─── Plugins ──────────────────────────────────────────────────────────────────

await fastify.register(cors, {
  origin: corsOrigins,
  methods: ['GET', 'POST', 'OPTIONS'],
});

// ─── Routes ───────────────────────────────────────────────────────────────────

await fastify.register(publicRoutes);
await fastify.register(adminRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────

fastify.get('/health', async (_request, reply) => {
  return reply.status(200).send({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────

async function shutdown(signal) {
  fastify.log.info({ signal }, 'Shutdown signal received, closing server…');
  await fastify.close();
  await prisma.$disconnect();
  fastify.log.info('Server closed. Goodbye.');
  process.exit(0);
}

process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// ─── Start ────────────────────────────────────────────────────────────────────

try {
  await fastify.listen({ port: PORT, host: HOST });
  fastify.log.info(
    { port: PORT, host: HOST, corsOrigins },
    `InkWhisper API listening on http://${HOST}:${PORT}`
  );
} catch (err) {
  fastify.log.error({ error: err.message }, 'Failed to start server');
  process.exit(1);
}
