/**
 * publicRoutes.js — PublicController
 *
 * Handles read-only access to StoryNode records.
 *
 * Routes:
 *   GET /nodes          → list all nodes (id, title, synopsis, wordCount, isPremium, createdAt)
 *   GET /nodes/:id      → full node including textContent
 */

import prisma from '../db.js';

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function publicRoutes(fastify) {
  /**
   * GET /nodes
   * Returns a summary list of all story nodes (no textContent to keep payload lean).
   */
  fastify.get('/nodes', async (request, reply) => {
    const startMs = Date.now();
    fastify.log.info({ endpoint: 'GET /nodes' }, 'Incoming request');

    try {
      const nodes = await prisma.storyNode.findMany({
        select: {
          id:                 true,
          title:              true,
          standaloneSynopsis: true,
          wordCount:          true,
          isPremium:          true,
          createdAt:          true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const elapsed = Date.now() - startMs;
      fastify.log.info(
        { endpoint: 'GET /nodes', count: nodes.length, elapsedMs: elapsed },
        'Request completed'
      );

      return reply.status(200).send(nodes);
    } catch (err) {
      fastify.log.error(
        { endpoint: 'GET /nodes', error: err.message },
        'Database error while listing StoryNodes'
      );
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * GET /nodes/:id
   * Returns the full StoryNode including textContent for the reader.
   */
  fastify.get('/nodes/:id', async (request, reply) => {
    const nodeId = Number(request.params.id);
    const startMs = Date.now();
    fastify.log.info({ endpoint: 'GET /nodes/:id', nodeId }, 'Incoming request');

    if (isNaN(nodeId) || nodeId < 1) {
      fastify.log.warn({ nodeId: request.params.id }, 'Invalid node ID received');
      return reply.status(400).send({ error: 'Invalid node ID' });
    }

    try {
      const node = await prisma.storyNode.findUnique({ where: { id: nodeId } });

      if (!node) {
        fastify.log.warn(
          { endpoint: 'GET /nodes/:id', nodeId },
          `StoryNode not found: ID ${nodeId}`
        );
        return reply.status(404).send({ error: `StoryNode ID ${nodeId} not found` });
      }

      const elapsed = Date.now() - startMs;
      fastify.log.info(
        { endpoint: 'GET /nodes/:id', nodeId, elapsedMs: elapsed },
        'Request completed'
      );

      return reply.status(200).send(node);
    } catch (err) {
      fastify.log.error(
        { endpoint: 'GET /nodes/:id', nodeId, error: err.message },
        `Failed to fetch StoryNode ID: ${nodeId}`
      );
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
