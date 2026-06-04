<script lang="ts">
  /**
   * ReaderControls
   * Floating / expandable control sheet for typography and theme customisation.
   * Designed for thumb ergonomics: all tap targets are ≥ 44px.
   */
  import {
    readerSettings,
    FONT_SIZE_STEPS,
    type FontFamily,
    type Theme,
  } from '$lib/stores/readerSettings';

  let open = $state(false);

  function toggleOpen() {
    open = !open;
  }

  const fontOptions: { value: FontFamily; label: string }[] = [
    { value: 'serif', label: 'Serif' },
    { value: 'sans', label: 'Sans' },
    { value: 'legible', label: 'Legible' },
  ];

  const themeOptions: { value: Theme; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'sepia', label: 'Sepia', icon: '🍂' },
  ];

  const currentStep = $derived($readerSettings.fontSizeStep);
  const atMin = $derived(currentStep === 0);
  const atMax = $derived(currentStep === FONT_SIZE_STEPS.length - 1);
</script>

<!-- Floating toggle button (always visible) -->
<div class="controls-wrapper" class:open>
  <button
    class="toggle-btn"
    onclick={toggleOpen}
    aria-expanded={open}
    aria-controls="reader-controls-sheet"
    aria-label={open ? 'Close reading settings' : 'Open reading settings'}
  >
    <span aria-hidden="true">{open ? '✕' : 'Aa'}</span>
  </button>

  <!-- Expandable sheet -->
  {#if open}
    <div
      id="reader-controls-sheet"
      class="sheet"
      role="dialog"
      aria-label="Reading settings"
    >
      <!-- Font size -->
      <div class="section">
        <p class="section-label">Font Size</p>
        <div class="size-row">
          <button
            class="icon-btn"
            onclick={() => readerSettings.decreaseFontSize()}
            disabled={atMin}
            aria-label="Decrease font size"
          >A−</button>
          <span class="size-display" aria-live="polite">
            {FONT_SIZE_STEPS[currentStep]}rem
          </span>
          <button
            class="icon-btn"
            onclick={() => readerSettings.increaseFontSize()}
            disabled={atMax}
            aria-label="Increase font size"
          >A+</button>
        </div>
      </div>

      <!-- Font family -->
      <div class="section">
        <p class="section-label">Font Style</p>
        <div class="btn-group">
          {#each fontOptions as opt (opt.value)}
            <button
              class="option-btn"
              class:active={$readerSettings.fontFamily === opt.value}
              onclick={() => readerSettings.setFontFamily(opt.value)}
              aria-pressed={$readerSettings.fontFamily === opt.value}
            >
              {opt.label}
            </button>
          {/each}
        </div>
      </div>

      <!-- Theme -->
      <div class="section">
        <p class="section-label">Theme</p>
        <div class="btn-group">
          {#each themeOptions as opt (opt.value)}
            <button
              class="option-btn theme-btn"
              class:active={$readerSettings.theme === opt.value}
              onclick={() => readerSettings.setTheme(opt.value)}
              aria-pressed={$readerSettings.theme === opt.value}
              data-theme-preview={opt.value}
            >
              <span aria-hidden="true">{opt.icon}</span>
              {opt.label}
            </button>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .controls-wrapper {
    position: fixed;
    bottom: 1.5rem;
    right: 1.25rem;
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.75rem;
  }

  .toggle-btn {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: none;
    background: var(--iw-text, #1a1a1a);
    color: var(--iw-bg, #ffffff);
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s ease;
    /* Accessible focus ring */
    outline-offset: 3px;
  }

  .toggle-btn:focus-visible {
    outline: 2px solid var(--iw-text, #1a1a1a);
  }

  .toggle-btn:active {
    transform: scale(0.94);
  }

  .sheet {
    background: var(--iw-bg, #ffffff);
    color: var(--iw-text, #1a1a1a);
    border: 1px solid color-mix(in srgb, var(--iw-text, #1a1a1a) 20%, transparent);
    border-radius: 16px;
    padding: 1.25rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
    width: min(320px, calc(100vw - 2.5rem));
    animation: slide-up 0.18s ease;
  }

  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .section {
    margin-bottom: 1.1rem;
  }

  .section:last-child {
    margin-bottom: 0;
  }

  .section-label {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 0.55;
    margin: 0 0 0.5rem;
  }

  .size-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .size-display {
    flex: 1;
    text-align: center;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .icon-btn {
    min-width: 44px;
    min-height: 44px;
    border-radius: 8px;
    border: 1px solid currentColor;
    background: transparent;
    color: inherit;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.12s;
  }

  .icon-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .icon-btn:not(:disabled):hover {
    background: color-mix(in srgb, currentColor 10%, transparent);
  }

  .btn-group {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .option-btn {
    flex: 1;
    min-height: 44px;
    padding: 0.4rem 0.6rem;
    border-radius: 8px;
    border: 1px solid color-mix(in srgb, currentColor 35%, transparent);
    background: transparent;
    color: inherit;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    transition:
      background 0.12s,
      border-color 0.12s;
  }

  .option-btn.active {
    background: var(--iw-text, #1a1a1a);
    color: var(--iw-bg, #ffffff);
    border-color: var(--iw-text, #1a1a1a);
  }

  .option-btn:not(.active):hover {
    background: color-mix(in srgb, currentColor 10%, transparent);
  }
</style>
