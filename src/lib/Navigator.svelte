<script>
  import Icon from "@iconify/svelte";

  export let tree = [];
  export let onFolderSelect;
  export let selectedFolder;

  let expanded = new Set();

  function toggle(node) {
    if (!node.children) return;

    if (expanded.has(node)) {
      expanded.delete(node);
    } else {
      expanded.add(node);
    }
    expanded = expanded; // trigger reactivity
  }

  function isFolder(node) {
    return node.children && node.children.length > 0;
  }

  function hasSubFolders(node) {
    return (
      node.children &&
      node.children.some((c) => c.children && c.children.length > 0)
    );
  }
</script>

{#each tree as node}
  {#if isFolder(node)}
    <div>
      <button
        class="row"
        class:selected={selectedFolder === node}
        on:click={() => onFolderSelect && onFolderSelect(node)}
      >
        {#if hasSubFolders(node)}
          <span
            class="arrow"
            role="presentation"
            on:click|stopPropagation={() => toggle(node)}
          >
            {#if expanded.has(node)}
              <Icon icon="mynaui:chevron-down-solid" width="24" height="24" />
            {:else}
              <Icon icon="mynaui:chevron-right-solid" width="24" height="24" />
            {/if}
          </span>
          <Icon icon="mynaui:folder-two" width="24" height="24" />
        {:else}
          <Icon icon="mynaui:folder" width="24" height="24" />
        {/if}

        {node.name}
      </button>

      {#if expanded.has(node)}
        <div class="indent">
          <svelte:self tree={node.children} {onFolderSelect} {selectedFolder} />
        </div>
      {/if}
    </div>
  {/if}
{/each}

<style>
  button {
    all: unset;
    width: 100%;
    box-sizing: border-box;
  }

  .row {
    cursor: pointer;
    width: 90%;
    margin: auto;
    margin-top: 4px;
    border-radius: 8px;
    font-size: 16px;
    padding: 0.25em;
    display: flex;
    align-items: center;
    gap: 0.25em;
  }

  .row:hover {
    background: rgba(0, 0, 0, 0.06);
  }

  .row.selected {
    background: rgba(59, 130, 246, 0.15);
    color: #2563eb;
  }

  .row.selected:hover {
    background: rgba(59, 130, 246, 0.2);
  }

  .arrow {
    width: 18px;
    display: inline-flex;
    justify-content: center;
    cursor: pointer;
    user-select: none;
  }

  .arrow:hover {
    color: rgba(59, 130, 246, 0.7);
  }

  .indent {
    margin-left: 20px;
  }
</style>
