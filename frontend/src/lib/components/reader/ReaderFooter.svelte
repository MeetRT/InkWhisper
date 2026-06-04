<script lang="ts">
  /**
   * ReaderFooter
   * Navigation portal for routing between standalone nodes and series chapters.
   * Shows a "Back to library" link plus optional prev/next chapter links.
   */

  /** Node ID of the previous chapter (undefined = this is first / standalone) */
  /** Node ID of the next chapter (undefined = this is last / standalone) */
  const {
    prevNodeId = undefined,
    nextNodeId = undefined,
  }: {
    prevNodeId?: number;
    nextNodeId?: number;
  } = $props();
</script>

<footer class="reader-footer">
  <div class="footer-inner">
    <nav class="nav-row" aria-label="Chapter navigation">
      <a class="nav-link nav-link--back" href="/">
        <span aria-hidden="true">⬅</span> Library
      </a>

      <div class="chapter-nav">
        {#if prevNodeId !== undefined}
          <a class="nav-link nav-link--prev" href="/read/{prevNodeId}" aria-label="Previous chapter">
            <span aria-hidden="true">‹</span> Prev
          </a>
        {:else}
          <span class="nav-link nav-link--disabled" aria-disabled="true">
            <span aria-hidden="true">‹</span> Prev
          </span>
        {/if}

        {#if nextNodeId !== undefined}
          <a class="nav-link nav-link--next" href="/read/{nextNodeId}" aria-label="Next chapter">
            Next <span aria-hidden="true">›</span>
          </a>
        {:else}
          <span class="nav-link nav-link--disabled" aria-disabled="true">
            Next <span aria-hidden="true">›</span>
          </span>
        {/if}
      </div>
    </nav>

    <p class="footer-branding" aria-hidden="true">InkWhisper</p>
  </div>
</footer>

<style>
  .reader-footer {
    width: 100%;
    padding: 2rem 1.25rem;
    margin-top: 3rem;
    border-top: 1px solid currentColor;
    opacity: 0.85;
  }

  .footer-inner {
    max-width: 650px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .nav-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .chapter-nav {
    display: flex;
    gap: 0.75rem;
  }

  .nav-link {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.6rem 1.1rem;
    min-height: 44px; /* touch target */
    border-radius: 8px;
    border: 1px solid currentColor;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--iw-text, #1a1a1a);
    text-decoration: none;
    transition: background 0.15s ease;
  }

  .nav-link:not(.nav-link--disabled):hover,
  .nav-link:not(.nav-link--disabled):focus-visible {
    background: color-mix(in srgb, var(--iw-text, #1a1a1a) 8%, transparent);
    outline: 2px solid var(--iw-text, #1a1a1a);
    outline-offset: 2px;
  }

  .nav-link--disabled {
    opacity: 0.35;
    cursor: not-allowed;
    pointer-events: none;
  }

  .footer-branding {
    text-align: center;
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    opacity: 0.4;
    margin: 0;
    color: var(--iw-text, #1a1a1a);
  }
</style>
