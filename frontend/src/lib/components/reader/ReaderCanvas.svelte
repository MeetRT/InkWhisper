<script lang="ts">
  /**
   * ReaderCanvas
   * The main reading container.  Renders the story text with typography driven
   * by CSS custom properties set by the readerSettings store.
   * Line-height: 1.8, max paragraph width: 650px, paragraph margin: 24px.
   */
  import { readerSettings } from '$lib/stores/readerSettings';
  import { createLogger } from '$lib/logger';

  const log = createLogger('READER_ENGINE');

  /** Rendered HTML string or raw text paragraphs from the story node */
  /** Node ID – used only for debug logging */
  const { textContent, nodeId }: { textContent: string; nodeId: number } = $props();

  $effect(() => {
    log.debug('ReaderCanvas mounted/updated', {
      nodeId,
      theme: $readerSettings.theme,
      fontFamily: $readerSettings.fontFamily,
      fontSizeStep: $readerSettings.fontSizeStep,
    });
  });

  /** Split plain text into paragraphs for rendering */
  const paragraphs = $derived(
    textContent
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
  );
</script>

<main
  class="reader-canvas"
  aria-label="Story content"
  id="reader-main"
>
  <article class="prose">
    {#each paragraphs as paragraph, i (i)}
      <p>{paragraph}</p>
    {/each}
  </article>
</main>

<style>
  .reader-canvas {
    width: 100%;
    min-height: 60vh;
    padding: 2rem 1.25rem 4rem;
    background: var(--iw-bg, #ffffff);
    color: var(--iw-text, #1a1a1a);
    transition:
      background 0.25s ease,
      color 0.25s ease;
  }

  .prose {
    max-width: 650px;
    margin: 0 auto;
    font-family: var(--iw-font-family, Georgia, Cambria, serif);
    font-size: var(--iw-font-size, 1.125rem);
    line-height: 1.8;
  }

  .prose p {
    margin-top: 0;
    margin-bottom: 24px;
    /* Prevent orphans / widows on long prose */
    orphans: 3;
    widows: 3;
  }

  .prose p:last-child {
    margin-bottom: 0;
  }

  /* Smooth font-size transitions so step changes don't feel jarring */
  :global(:root) {
    transition:
      --iw-font-size 0.2s ease,
      --iw-bg 0.25s ease,
      --iw-text 0.25s ease;
  }
</style>
