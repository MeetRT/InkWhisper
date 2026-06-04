<!--
  Home page — public library index.
  Lists all available (non-premium) story nodes so readers can pick one.
-->
<script lang="ts">
  import { fetchWithLogging, createLogger } from '$lib/logger';
  import type { StoryNode } from '$lib/types';

  const log = createLogger('READER_ENGINE');

  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

  let nodes = $state<StoryNode[]>([]);
  let loading = $state(true);
  let errorMsg = $state('');

  $effect(() => {
    log.info('Home page – fetching library');
    fetchWithLogging<StoryNode[]>('READER_ENGINE', `${API_BASE}/nodes`)
      .then((data) => {
        nodes = data;
        log.info('Library loaded', { count: data.length });
      })
      .catch((err: unknown) => {
        errorMsg = err instanceof Error ? err.message : 'Failed to load library.';
        log.error('Library fetch failed', { error: String(err) });
      })
      .finally(() => {
        loading = false;
      });
  });
</script>

<svelte:head>
  <title>InkWhisper — Reading Library</title>
  <meta name="description" content="Self-hosted long-form reading platform." />
</svelte:head>

<div class="home-page">
  <header class="home-header">
    <h1 class="brand">InkWhisper</h1>
    <nav class="header-nav">
      <a href="/admin/write" class="nav-link">Admin ✦</a>
    </nav>
  </header>

  <main class="home-main">
    {#if loading}
      <p class="state-msg" aria-live="polite">Loading library…</p>
    {:else if errorMsg}
      <p class="state-msg error-msg" role="alert">⚠ {errorMsg}</p>
    {:else if nodes.length === 0}
      <p class="state-msg">The library is empty. <a href="/admin/write">Add a story.</a></p>
    {:else}
      <ul class="story-list">
        {#each nodes as node (node.id)}
          <li class="story-card">
            <a class="story-link" href="/read/{node.id}">
              <div class="story-info">
                <span class="story-title">{node.title}</span>
                <span class="story-meta">
                  {node.wordCount.toLocaleString()} words
                  {#if node.isPremium}
                    <span class="badge-premium">✦ Premium</span>
                  {/if}
                </span>
                {#if node.standaloneSynopsis}
                  <p class="story-synopsis">{node.standaloneSynopsis}</p>
                {/if}
              </div>
              <span class="arrow" aria-hidden="true">›</span>
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </main>
</div>

<style>
  .home-page {
    min-height: 100dvh;
    background: var(--iw-bg, #ffffff);
    color: var(--iw-text, #1a1a1a);
  }

  .home-header {
    max-width: 650px;
    margin: 0 auto;
    padding: 1.75rem 1.25rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .brand {
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.02em;
  }

  .header-nav {
    display: flex;
    gap: 0.75rem;
  }

  .nav-link {
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
    border: 1px solid currentColor;
    color: var(--iw-text, #1a1a1a);
    text-decoration: none;
    min-height: 40px;
    display: flex;
    align-items: center;
    transition: background 0.12s;
  }

  .nav-link:hover {
    background: color-mix(in srgb, currentColor 8%, transparent);
  }

  .home-main {
    max-width: 650px;
    margin: 0 auto;
    padding: 0 1.25rem 4rem;
  }

  .state-msg {
    color: var(--iw-text, #1a1a1a);
    opacity: 0.6;
    font-size: 0.95rem;
  }

  .error-msg {
    color: #b91c1c;
    opacity: 1;
  }

  .story-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .story-card {
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--iw-text, #1a1a1a) 15%, transparent);
    transition: box-shadow 0.15s;
  }

  .story-card:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }

  .story-link {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.1rem;
    text-decoration: none;
    color: inherit;
    min-height: 64px;
    gap: 0.75rem;
  }

  .story-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .story-title {
    font-size: 1rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .story-meta {
    font-size: 0.78rem;
    opacity: 0.6;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .badge-premium {
    background: #c9a84c;
    color: #fff;
    padding: 0.1rem 0.45rem;
    border-radius: 999px;
    font-size: 0.68rem;
    font-weight: 700;
    opacity: 1;
  }

  .story-synopsis {
    margin: 0.3rem 0 0;
    font-size: 0.83rem;
    line-height: 1.5;
    opacity: 0.7;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    overflow: hidden;
  }

  .arrow {
    font-size: 1.4rem;
    opacity: 0.4;
    flex-shrink: 0;
  }
</style>
