/**
 * db.js — Singleton Prisma client
 *
 * Exporting a single PrismaClient instance prevents exhausting SQLite
 * connections during development reloads.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn',  emit: 'stdout' },
  ],
});

export default prisma;
