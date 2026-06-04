<script lang="ts">
  /**
   * ReaderHeader
   * Displays the story title, standalone synopsis, and key metadata metrics
   * (word count, estimated reading time, premium badge).
   */
  import type { StoryNode } from '$lib/types';

  const { node }: { node: StoryNode } = $props();

  /** Average adult reading speed (words per minute) */
  const WPM = 238;

  const readingMinutes = $derived(Math.ceil(node.wordCount / WPM));
  const readingLabel = $derived(
    readingMinutes < 2
      ? '< 1 min read'
      : readingMinutes < 60
        ? `${readingMinutes} min read`
        : `${Math.floor(readingMinutes / 60)}h ${readingMinutes % 60}m read`
  );

  const createdDate = $derived(
    new Date(node.createdAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  );
</script>

<header class="reader-header">
  <div class="header-inner">
    {#if node.isPremium}
      <span class="badge-premium" aria-label="Premium content">✦ Premium</span>
    {/if}

    <h1 class="story-title">{node.title}</h1>

    {#if node.standaloneSynopsis}
      <p class="synopsis">{node.standaloneSynopsis}</p>
    {/if}

    <div class="meta-row" aria-label="Story metadata">
      <span class="meta-item" title="Word count">
        <span class="meta-icon" aria-hidden="true">📖</span>
        {node.wordCount.toLocaleString()} words
      </span>
      <span class="meta-sep" aria-hidden="true">·</span>
      <span class="meta-item" title="Estimated reading time">
        <span class="meta-icon" aria-hidden="true">⏱</span>
        {readingLabel}
      </span>
      <span class="meta-sep" aria-hidden="true">·</span>
      <span class="meta-item" title="Published date">
        <span class="meta-icon" aria-hidden="true">🗓</span>
        {createdDate}
      </span>
    </div>

    <hr class="header-divider" />
  </div>
</header>

<style>
  .reader-header {
    width: 100%;
    padding: 2rem 1.25rem 0;
  }

  .header-inner {
    max-width: 650px;
    margin: 0 auto;
  }

  .badge-premium {
    display: inline-block;
    margin-bottom: 0.75rem;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    background: #c9a84c;
    color: #fff;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .story-title {
    margin: 0 0 0.75rem;
    font-size: clamp(1.5rem, 5vw, 2.25rem);
    font-weight: 700;
    line-height: 1.25;
    color: var(--iw-text, #1a1a1a);
  }

  .synopsis {
    margin: 0 0 1rem;
    font-size: 1rem;
    line-height: 1.7;
    color: var(--iw-text, #1a1a1a);
    opacity: 0.8;
    font-style: italic;
  }

  .meta-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem 0;
    font-size: 0.8rem;
    color: var(--iw-text, #1a1a1a);
    opacity: 0.65;
    margin-bottom: 1.25rem;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .meta-sep {
    margin: 0 0.4rem;
  }

  .header-divider {
    border: none;
    border-top: 1px solid currentColor;
    opacity: 0.15;
    margin: 0;
  }
</style>
