<script>
  export let items = [];
  export let onSelect;
  export let selectedFile = null;
</script>

{#if items.length > 0}
  <div class="list">
    {#each items as item}
      <button
        class="item"
        class:selected={selectedFile === item}
        on:click={() => onSelect?.(item)}
      >
        <span class="icon">📄</span>
        {item.name}
      </button>
    {/each}
  </div>
{:else}
  <div class="empty">Select a folder to view its files</div>
{/if}

<style>
  .list {
    border-left: 1px solid rgba(0, 0, 0, 0.1);
  }

  .item {
    all: unset;
    display: flex;
    align-items: center;
    gap: 0.5em;
    padding: 0.5em 0.75em;
    width: 90%;
    margin: auto;
    margin-top: 4px;
    border-radius: 8px;
    box-sizing: border-box;
    cursor: pointer;
    font-size: 14px;
  }

  .item:hover {
    background: rgba(0, 0, 0, 0.06);
  }

  .item.selected {
    background: rgba(59, 130, 246, 0.15);
    color: #2563eb;
  }

  .item.selected:hover {
    background: rgba(59, 130, 246, 0.2);
  }

  .icon {
    font-size: 16px;
  }

  .empty {
    padding: 2em;
    text-align: center;
    color: #999;
    font-style: italic;
  }
</style>
