/**
 * adminRoutes.js — AdminController
 *
 * Handles authenticated content-creation operations.
 * (Authentication is out of scope for Milestone 1 but the prefix /admin
 * makes it straightforward to add a middleware guard later.)
 *
 * Routes:
 *   POST /admin/nodes   → create a new StoryNode
 */

import prisma from '../db.js';

/** Count words in a string (split on any whitespace run) */
function countWords(text) {
  const trimmed = text.trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
}

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function adminRoutes(fastify) {
  /**
   * POST /admin/nodes
   * Creates a new StoryNode.  wordCount is computed server-side from textContent.
   *
   * Body:
   *   { title, standaloneSynopsis?, textContent, isPremium? }
   */
  fastify.post('/admin/nodes', async (request, reply) => {
    const startMs = Date.now();
    fastify.log.info({ endpoint: 'POST /admin/nodes' }, 'Incoming request');

    const { title, standaloneSynopsis = '', textContent, isPremium = false } = request.body ?? {};

    // ── Validation ────────────────────────────────────────────────────────────
    if (!title || typeof title !== 'string' || title.trim() === '') {
      fastify.log.warn({ endpoint: 'POST /admin/nodes' }, 'Validation failed: missing title');
      return reply.status(400).send({ error: 'title is required and must be a non-empty string' });
    }

    if (!textContent || typeof textContent !== 'string' || textContent.trim() === '') {
      fastify.log.warn(
        { endpoint: 'POST /admin/nodes' },
        'Validation failed: missing textContent'
      );
      return reply.status(400).send({ error: 'textContent is required and must be non-empty' });
    }

    const wordCount = countWords(textContent);
    fastify.log.debug(
      { endpoint: 'POST /admin/nodes', title, wordCount, isPremium },
      'Payload validated'
    );

    // ── Persist ───────────────────────────────────────────────────────────────
    try {
      const node = await prisma.storyNode.create({
        data: {
          title:              title.trim(),
          standaloneSynopsis: standaloneSynopsis.trim(),
          textContent:        textContent.trim(),
          wordCount,
          isPremium:          Boolean(isPremium),
        },
      });

      const elapsed = Date.now() - startMs;
      fastify.log.info(
        { endpoint: 'POST /admin/nodes', nodeId: node.id, wordCount: node.wordCount, elapsedMs: elapsed },
        `StoryNode created: ID ${node.id} – "${node.title}"`
      );

      return reply.status(201).send(node);
    } catch (err) {
      fastify.log.error(
        { endpoint: 'POST /admin/nodes', error: err.message },
        'Failed to create StoryNode'
      );
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
