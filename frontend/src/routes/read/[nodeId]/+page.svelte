<!--
  /read/[nodeId]/+page.svelte
  Public reading layout – fetches a single StoryNode and renders the full
  reader experience (header, canvas, controls, footer).
-->
<script lang="ts">
  import { page } from '$app/stores';
  import { fetchWithLogging } from '$lib/logger';
  import { createLogger } from '$lib/logger';
  import ReaderHeader from '$lib/components/reader/ReaderHeader.svelte';
  import ReaderCanvas from '$lib/components/reader/ReaderCanvas.svelte';
  import ReaderControls from '$lib/components/reader/ReaderControls.svelte';
  import ReaderFooter from '$lib/components/reader/ReaderFooter.svelte';
  import type { StoryNode } from '$lib/types';

  const log = createLogger('READER_ENGINE');

  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

  let node = $state<StoryNode | null>(null);
  let loading = $state(true);
  let errorMsg = $state('');

  const nodeId = $derived(Number($page.params.nodeId));

  $effect(() => {
    // Re-fetch whenever nodeId changes (e.g. navigating between chapters)
    const id = nodeId;
    loading = true;
    errorMsg = '';
    node = null;
    log.info('Reader page – loading node', { nodeId: id });

    fetchWithLogging<StoryNode>('READER_ENGINE', `${API_BASE}/nodes/${id}`)
      .then((loaded) => {
        node = loaded;
        log.info('Story node loaded', { id: loaded.id, title: loaded.title, wordCount: loaded.wordCount });
      })
      .catch((err: unknown) => {
        errorMsg = err instanceof Error ? err.message : 'Could not load story.';
        log.error('Failed to load story node', { nodeId: id, error: String(err) });
      })
      .finally(() => {
        loading = false;
      });
  });
</script>

<svelte:head>
  {#if node}
    <title>{node.title} — InkWhisper</title>
    <meta name="description" content={node.standaloneSynopsis || node.title} />
  {:else}
    <title>Loading… — InkWhisper</title>
  {/if}
</svelte:head>

<div class="reader-page">
  {#if loading}
    <div class="state-center" aria-live="polite" aria-label="Loading story">
      <div class="spinner" aria-hidden="true"></div>
      <p>Loading story…</p>
    </div>
  {:else if errorMsg}
    <div class="state-center" role="alert">
      <p class="error-text">⚠ {errorMsg}</p>
      <a href="/" class="back-link">← Back to library</a>
    </div>
  {:else if node}
    <ReaderHeader {node} />
    <ReaderCanvas textContent={node.textContent} nodeId={node.id} />
    <ReaderFooter />
    <ReaderControls />
  {/if}
</div>

<style>
  .reader-page {
    min-height: 100dvh;
    background: var(--iw-bg, #ffffff);
    color: var(--iw-text, #1a1a1a);
    transition:
      background 0.25s ease,
      color 0.25s ease;
  }

  .state-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    gap: 1rem;
    padding: 2rem;
    color: var(--iw-text, #1a1a1a);
  }

  .error-text {
    font-size: 1rem;
    color: #b91c1c;
  }

  .back-link {
    color: var(--iw-text, #1a1a1a);
    font-size: 0.9rem;
    text-decoration: underline;
  }

  .spinner {
    width: 36px;
    height: 36px;
    border: 3px solid color-mix(in srgb, var(--iw-text, #1a1a1a) 20%, transparent);
    border-top-color: var(--iw-text, #1a1a1a);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
