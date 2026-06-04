<script lang="ts">
  /**
   * StoryEditor
   * Manuscript textarea with real-time word counter and form submission.
   * Logs every meaningful action with the [ADMIN_ACTION] prefix.
   */
  import { createLogger } from '$lib/logger';
  import { fetchWithLogging } from '$lib/logger';
  import type { StoryNode, CreateStoryNodePayload } from '$lib/types';

  const log = createLogger('ADMIN_ACTION');

  const { onCreated = () => {} }: { onCreated?: (node: StoryNode) => void } = $props();

  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

  let title = $state('');
  let standaloneSynopsis = $state('');
  let textContent = $state('');
  let isPremium = $state(false);
  let submitting = $state(false);
  let errorMsg = $state('');
  let successMsg = $state('');

  /** Count words in a string (split on any whitespace) */
  function countWords(text: string): number {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  }

  const wordCount = $derived(countWords(textContent));
  const charCount = $derived(textContent.length);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    errorMsg = '';
    successMsg = '';

    if (!title.trim()) {
      errorMsg = 'Title is required.';
      return;
    }
    if (!textContent.trim()) {
      errorMsg = 'Manuscript content cannot be empty.';
      return;
    }

    submitting = true;
    log.info('Submitting new story node', { title, wordCount, isPremium });

    const payload: CreateStoryNodePayload = {
      title: title.trim(),
      standaloneSynopsis: standaloneSynopsis.trim(),
      textContent: textContent.trim(),
      isPremium,
    };

    try {
      const created = await fetchWithLogging<StoryNode>(
        'ADMIN_ACTION',
        `${API_BASE}/admin/nodes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      log.info('Story node created successfully', { id: created.id, title: created.title });
      successMsg = `"${created.title}" saved (ID ${created.id}, ${created.wordCount} words).`;
      onCreated(created);
      // Reset form
      title = '';
      standaloneSynopsis = '';
      textContent = '';
      isPremium = false;
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'Unknown error. Check the console.';
      log.error('Failed to create story node', { error: String(err) });
    } finally {
      submitting = false;
    }
  }
</script>

<section class="editor-wrapper">
  <h2 class="editor-heading">New Story Node</h2>

  <form class="editor-form" onsubmit={handleSubmit} novalidate>
    <!-- Title -->
    <div class="field">
      <label class="field-label" for="title">Title <span aria-hidden="true">*</span></label>
      <input
        id="title"
        class="field-input"
        type="text"
        bind:value={title}
        placeholder="Enter story title…"
        maxlength="255"
        required
        aria-required="true"
      />
    </div>

    <!-- Synopsis -->
    <div class="field">
      <label class="field-label" for="synopsis">Standalone Synopsis</label>
      <textarea
        id="synopsis"
        class="field-input field-textarea field-textarea--short"
        bind:value={standaloneSynopsis}
        placeholder="Optional short description shown on the reader header…"
        rows="3"
      ></textarea>
    </div>

    <!-- Manuscript -->
    <div class="field">
      <label class="field-label" for="textContent">
        Manuscript <span aria-hidden="true">*</span>
      </label>
      <textarea
        id="textContent"
        class="field-input field-textarea"
        bind:value={textContent}
        placeholder="Write your story here… Separate paragraphs with a blank line."
        rows="18"
        required
        aria-required="true"
      ></textarea>
      <div class="word-counter" aria-live="polite" aria-atomic="true">
        <span class:counter-warning={wordCount > 0 && wordCount < 100}>
          {wordCount.toLocaleString()} {wordCount === 1 ? 'word' : 'words'}
        </span>
        <span class="counter-sep">·</span>
        <span>{charCount.toLocaleString()} chars</span>
      </div>
    </div>

    <!-- Premium toggle -->
    <div class="field field--inline">
      <input
        id="isPremium"
        class="checkbox"
        type="checkbox"
        bind:checked={isPremium}
      />
      <label class="field-label field-label--inline" for="isPremium">
        Mark as Premium
      </label>
    </div>

    <!-- Feedback -->
    {#if errorMsg}
      <p class="feedback feedback--error" role="alert">{errorMsg}</p>
    {/if}
    {#if successMsg}
      <p class="feedback feedback--success" role="status">{successMsg}</p>
    {/if}

    <button class="submit-btn" type="submit" disabled={submitting}>
      {submitting ? 'Saving…' : 'Publish Node'}
    </button>
  </form>
</section>

<style>
  .editor-wrapper {
    max-width: 720px;
    margin: 0 auto;
    padding: 1.5rem 1.25rem 4rem;
  }

  .editor-heading {
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0 0 1.5rem;
    color: var(--iw-text, #1a1a1a);
  }

  .editor-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .field--inline {
    flex-direction: row;
    align-items: center;
    gap: 0.6rem;
  }

  .field-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--iw-text, #1a1a1a);
    opacity: 0.8;
  }

  .field-label--inline {
    margin: 0;
    cursor: pointer;
  }

  .field-input {
    padding: 0.65rem 0.85rem;
    border-radius: 8px;
    border: 1px solid color-mix(in srgb, var(--iw-text, #1a1a1a) 30%, transparent);
    background: color-mix(in srgb, var(--iw-bg, #fff) 95%, var(--iw-text, #1a1a1a));
    color: var(--iw-text, #1a1a1a);
    font-size: 1rem;
    font-family: inherit;
    width: 100%;
    box-sizing: border-box;
    transition: border-color 0.15s;
  }

  .field-input:focus-visible {
    outline: 2px solid var(--iw-text, #1a1a1a);
    outline-offset: 1px;
    border-color: transparent;
  }

  .field-textarea {
    resize: vertical;
    line-height: 1.6;
    min-height: 120px;
  }

  .field-textarea--short {
    min-height: 72px;
  }

  .word-counter {
    font-size: 0.78rem;
    color: var(--iw-text, #1a1a1a);
    opacity: 0.55;
    display: flex;
    gap: 0.35rem;
    align-items: center;
  }

  .counter-warning {
    color: #c0782a;
    opacity: 1;
  }

  .counter-sep {
    opacity: 0.5;
  }

  .checkbox {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: var(--iw-text, #1a1a1a);
  }

  .feedback {
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-size: 0.9rem;
    margin: 0;
  }

  .feedback--error {
    background: #fde8e8;
    color: #b91c1c;
    border: 1px solid #fca5a5;
  }

  .feedback--success {
    background: #dcfce7;
    color: #15803d;
    border: 1px solid #86efac;
  }

  .submit-btn {
    align-self: flex-start;
    padding: 0.75rem 1.75rem;
    min-height: 48px;
    border-radius: 10px;
    border: none;
    background: var(--iw-text, #1a1a1a);
    color: var(--iw-bg, #ffffff);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .submit-btn:not(:disabled):hover {
    opacity: 0.85;
  }
</style>
