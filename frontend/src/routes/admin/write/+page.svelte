<!--
  /admin/write/+page.svelte
  Content creation portal – StoryEditor at the top, AdminLibraryList below.
  When a new node is created the library list auto-refreshes.
-->
<script lang="ts">
  import StoryEditor from '$lib/components/admin/StoryEditor.svelte';
  import AdminLibraryList from '$lib/components/admin/AdminLibraryList.svelte';
  import type { StoryNode } from '$lib/types';

  let libraryList: AdminLibraryList;

  function handleNodeCreated(_node: StoryNode) {
    libraryList?.refresh();
  }
</script>

<svelte:head>
  <title>Write — InkWhisper Admin</title>
</svelte:head>

<div class="admin-page">
  <header class="admin-header">
    <a href="/" class="brand-link">⟵ InkWhisper</a>
    <h1 class="page-title">Admin — Story Workshop</h1>
  </header>

  <main>
    <StoryEditor onCreated={handleNodeCreated} />
    <hr class="divider" />
    <AdminLibraryList bind:this={libraryList} />
  </main>
</div>

<style>
  .admin-page {
    min-height: 100dvh;
    background: var(--iw-bg, #ffffff);
    color: var(--iw-text, #1a1a1a);
  }

  .admin-header {
    max-width: 720px;
    margin: 0 auto;
    padding: 1.25rem 1.25rem 0;
    display: flex;
    align-items: center;
    gap: 1.25rem;
    flex-wrap: wrap;
  }

  .brand-link {
    font-size: 0.85rem;
    color: var(--iw-text, #1a1a1a);
    text-decoration: none;
    opacity: 0.6;
    transition: opacity 0.12s;
  }

  .brand-link:hover {
    opacity: 1;
    text-decoration: underline;
  }

  .page-title {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0;
    color: var(--iw-text, #1a1a1a);
  }

  .divider {
    max-width: 720px;
    margin: 1rem auto;
    border: none;
    border-top: 1px solid color-mix(in srgb, var(--iw-text, #1a1a1a) 12%, transparent);
    padding: 0 1.25rem;
  }
</style>
