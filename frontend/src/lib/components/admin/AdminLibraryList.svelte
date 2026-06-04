<script lang="ts">
  /**
   * AdminLibraryList
   * Dashboard listing all created story nodes fetched from the backend API.
   * Supports reactive refresh when a new node is added via StoryEditor.
   */
  import { onMount } from 'svelte';
  import { fetchWithLogging } from '$lib/logger';
  import { createLogger } from '$lib/logger';
  import type { StoryNode } from '$lib/types';

  const log = createLogger('ADMIN_ACTION');

  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

  let nodes: StoryNode[] = $state([]);
  let loading = $state(true);
  let errorMsg = $state('');

  export async function refresh(): Promise<void> {
    loading = true;
    errorMsg = '';
    log.info('Refreshing library list');
    try {
      nodes = await fetchWithLogging<StoryNode[]>('ADMIN_ACTION', `${API_BASE}/nodes`);
      log.info('Library list loaded', { count: nodes.length });
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'Failed to load library.';
      log.error('Library list load failed', { error: String(err) });
    } finally {
      loading = false;
    }
  }

  onMount(refresh);
</script>

<section class="library-wrapper">
  <div class="library-header">
    <h2 class="library-heading">Your Library</h2>
    <button
      class="refresh-btn"
    onclick={refresh}
      disabled={loading}
      aria-label="Refresh library list"
    >
      {loading ? '↻ Loading…' : '↻ Refresh'}
    </button>
  </div>

  {#if errorMsg}
    <p class="error-msg" role="alert">{errorMsg}</p>
  {:else if loading}
    <ul class="node-list" aria-busy="true">
      {#each Array(3) as _, i (i)}
        <li class="node-card node-card--skeleton" aria-hidden="true">
          <div class="skeleton-title"></div>
          <div class="skeleton-meta"></div>
        </li>
      {/each}
    </ul>
  {:else if nodes.length === 0}
    <p class="empty-msg">No story nodes yet. Create your first one above!</p>
  {:else}
    <ul class="node-list">
      {#each nodes as node (node.id)}
        <li class="node-card">
          <div class="node-info">
            <a class="node-title" href="/read/{node.id}" target="_blank" rel="noreferrer">
              {node.title}
            </a>
            <div class="node-meta">
              <span>{node.wordCount.toLocaleString()} words</span>
              <span class="meta-sep">·</span>
              <span>{new Date(node.createdAt).toLocaleDateString()}</span>
              {#if node.isPremium}
                <span class="meta-sep">·</span>
                <span class="badge-premium">Premium</span>
              {/if}
            </div>
            {#if node.standaloneSynopsis}
              <p class="node-synopsis">{node.standaloneSynopsis}</p>
            {/if}
          </div>
          <a
            class="read-link"
            href="/read/{node.id}"
            target="_blank"
            rel="noreferrer"
            aria-label="Read {node.title}"
          >
            Read →
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .library-wrapper {
    max-width: 720px;
    margin: 2rem auto 0;
    padding: 0 1.25rem 4rem;
  }

  .library-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .library-heading {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: var(--iw-text, #1a1a1a);
  }

  .refresh-btn {
    padding: 0.45rem 1rem;
    min-height: 40px;
    border-radius: 8px;
    border: 1px solid currentColor;
    background: transparent;
    color: var(--iw-text, #1a1a1a);
    font-size: 0.85rem;
    cursor: pointer;
    transition: background 0.12s;
  }

  .refresh-btn:not(:disabled):hover {
    background: color-mix(in srgb, currentColor 8%, transparent);
  }

  .refresh-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error-msg {
    color: #b91c1c;
    font-size: 0.9rem;
    padding: 0.75rem 1rem;
    background: #fde8e8;
    border-radius: 8px;
    border: 1px solid #fca5a5;
  }

  .empty-msg {
    color: var(--iw-text, #1a1a1a);
    opacity: 0.55;
    font-size: 0.95rem;
  }

  .node-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .node-card {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem 1.1rem;
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--iw-text, #1a1a1a) 18%, transparent);
    background: color-mix(in srgb, var(--iw-bg, #fff) 98%, var(--iw-text, #1a1a1a));
    transition: box-shadow 0.15s;
  }

  .node-card:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }

  .node-info {
    flex: 1;
    min-width: 0;
  }

  .node-title {
    display: block;
    font-size: 1rem;
    font-weight: 600;
    color: var(--iw-text, #1a1a1a);
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .node-title:hover {
    text-decoration: underline;
  }

  .node-meta {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.78rem;
    color: var(--iw-text, #1a1a1a);
    opacity: 0.6;
    margin-top: 0.25rem;
  }

  .meta-sep {
    opacity: 0.5;
  }

  .badge-premium {
    background: #c9a84c;
    color: #fff;
    padding: 0.1rem 0.5rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 700;
    opacity: 1;
  }

  .node-synopsis {
    margin: 0.5rem 0 0;
    font-size: 0.85rem;
    line-height: 1.5;
    color: var(--iw-text, #1a1a1a);
    opacity: 0.7;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    overflow: hidden;
  }

  .read-link {
    flex-shrink: 0;
    padding: 0.45rem 0.85rem;
    min-height: 40px;
    border-radius: 8px;
    border: 1px solid currentColor;
    color: var(--iw-text, #1a1a1a);
    font-size: 0.85rem;
    font-weight: 500;
    text-decoration: none;
    display: flex;
    align-items: center;
    transition: background 0.12s;
  }

  .read-link:hover {
    background: color-mix(in srgb, currentColor 8%, transparent);
  }

  /* Loading skeleton */
  .node-card--skeleton {
    pointer-events: none;
  }

  .skeleton-title,
  .skeleton-meta {
    border-radius: 4px;
    background: color-mix(in srgb, var(--iw-text, #1a1a1a) 12%, transparent);
    animation: shimmer 1.4s infinite ease-in-out;
  }

  .skeleton-title {
    height: 1rem;
    width: 60%;
    margin-bottom: 0.5rem;
  }

  .skeleton-meta {
    height: 0.75rem;
    width: 35%;
  }

  @keyframes shimmer {
    0%,
    100% {
      opacity: 0.4;
    }
    50% {
      opacity: 0.8;
    }
  }
</style>
