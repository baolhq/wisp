<script>
  import Icon from "@iconify/svelte";
  import ContextMenu from "./ContextMenu.svelte";

  export let items = [];
  export let onSelect;
  export let selectedFile = null;
  export let onCreateNote;
  export let onRename;
  export let onDelete;

  function getMenuItems(node) {
    return [
      {
        text: "New Note",
        shortcut: "Ctrl+N",
        action: () => onCreateNote(node),
      },
      {
        text: "Rename",
        shortcut: "F2",
        action: () => onRename(node),
      },
      { text: "Divider" },
      {
        text: "Delete",
        shortcut: "Delete",
        action: () => onDelete(node),
      },
    ];
  }
</script>

{#if items.length > 0}
  <div class="list">
    {#each items as item}
      <ContextMenu items={getMenuItems(item)}>
        <button
          class="item"
          class:selected={selectedFile === item}
          on:click={() => onSelect?.(item)}
        >
          <Icon icon="mynaui:file" width="16" height="16" />
          {item.name}
        </button>
      </ContextMenu>
    {/each}
  </div>
{:else}
  <div class="empty">Select a folder to view its files</div>
{/if}

<style>
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
    color: var(--fg);
  }

  .item:hover {
    background: var(--border);
  }

  .item.selected {
    background: var(--border);
    color: var(--fg);
  }

  .empty {
    padding: 2em;
    text-align: center;
    color: #999;
    font-style: italic;
  }
</style>
