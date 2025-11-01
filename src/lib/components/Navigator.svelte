<script>
  import Icon from "@iconify/svelte";
  import ContextMenu from "./ContextMenu.svelte";
  import { tick } from "svelte";

  export let nodes = [];
  export let onFolderSelect;
  export let selectedFolder;
  export let onCreateNotebook;
  export let onCreateNote;
  export let onRename;
  export let onDelete;
  export let expanded = new Set();
  export let isRoot = true;
  export let editing = null;
  export let tempName = "";

  let renameInput;

  $: if (renameInput && editing) {
    renameInput.focus();
    renameInput.select();
  }

  async function startRename(node) {
    editing = node;
    tempName = node.name;
    await tick();
  }

  function cancelRename() {
    editing = null;
  }

  async function commitRename() {
    if (!tempName.trim() || !editing || tempName === editing.name)
      return cancelRename();
    await onRename(editing, tempName.trim());
    cancelRename();
  }

  function toggle(node) {
    if (!node.children) return;
    expanded.has(node) ? expanded.delete(node) : expanded.add(node);
    expanded = expanded;
  }

  const isFolder = (n) => n.children != null;
  const hasSubFolders = (n) => n.children?.length;
  const ascendingByName = (a, b) => a.path.localeCompare(b.path);

  function getMenuItems(node) {
    return [
      {
        text: "New Note",
        shortcut: "Ctrl+N",
        action: () => onCreateNote(node),
      },
      {
        text: "New Notebook",
        shortcut: "Ctrl+Shift+N",
        action: () => onCreateNotebook(selectedFolder),
      },
      {
        text: "Rename",
        shortcut: "F2",
        action: () => startRename(selectedFolder),
      },
      { text: "Divider" },
      { text: "Delete", shortcut: "Delete", action: () => onDelete(node) },
    ];
  }
</script>

{#if isRoot}
  <div class="header">
    <span class="title">Notebooks</span>
    <button class="add-btn" on:click={() => onCreateNotebook({ path: "" })}>
      <Icon icon="mynaui:plus" width="20" height="20" />
    </button>
  </div>

  {#if nodes.length === 0}
    <div class="empty-state">
      <p>No notebooks yet</p>
      <button on:click={onCreateNotebook}>
        <Icon icon="mynaui:plus" width="16" height="16" />
        Create your first notebook
      </button>
    </div>
  {/if}
{/if}

{#each nodes.sort(ascendingByName) as node}
  {#if isFolder(node)}
    <ContextMenu items={getMenuItems(node)}>
      <div>
        <button
          class="row"
          class:selected={selectedFolder === node}
          on:click={() => onFolderSelect?.(node)}
          on:contextmenu={() => onFolderSelect?.(node)}
        >
          {#if hasSubFolders(node)}
            <span
              class="expand-icon"
              role="presentation"
              on:click={() => toggle(node)}
            >
              <Icon
                icon={expanded.has(node)
                  ? "mynaui:chevron-down"
                  : "mynaui:chevron-right"}
                width="16"
                height="16"
              />
            </span>
          {:else}
            <span class="expand-icon-placeholder"></span>
          {/if}

          <Icon icon="mynaui:book" width="20" height="20" />

          {#if node === editing}
            <input
              class="rename-input"
              bind:this={renameInput}
              bind:value={tempName}
              spellcheck={false}
              on:blur={commitRename}
              on:keydown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") cancelRename();
              }}
            />
          {:else}
            <span
              class="node-name"
              on:dblclick={() => startRename(node)}
              role="presentation"
            >
              {node.name}
            </span>
          {/if}
        </button>

        {#if expanded.has(node) && node.children}
          <div class="indent">
            <svelte:self
              nodes={node.children}
              {onFolderSelect}
              {selectedFolder}
              {onCreateNotebook}
              {onCreateNote}
              {onRename}
              {onDelete}
              {expanded}
              bind:editing
              bind:tempName
              isRoot={false}
            />
          </div>
        {/if}
      </div>
    </ContextMenu>
  {/if}
{/each}

<style>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    margin-bottom: 8px;
  }

  .title {
    font-weight: 600;
    font-size: 14px;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  button,
  .add-btn {
    all: unset;
    cursor: pointer;
  }

  .add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 6px;
    transition: all 0.2s;
    color: #666;
  }

  .add-btn:hover {
    background: rgba(0, 0, 0, 0.06);
    color: #2563eb;
  }

  .empty-state {
    padding: 32px 16px;
    text-align: center;
    color: #999;
  }

  .empty-state p {
    margin: 0 0 16px;
    font-size: 14px;
  }

  button {
    width: 100%;
    box-sizing: border-box;
  }

  .row {
    cursor: pointer;
    width: 90%;
    margin: 4px auto 0;
    border-radius: 8px;
    font-size: 14px;
    padding: 6px 8px;
    display: flex;
    align-items: center;
  }

  .row:hover {
    background: #333;
    color: #fff;
  }

  .row.selected {
    background: #111;
    color: #fff;
  }

  .expand-icon,
  .expand-icon-placeholder {
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  .expand-icon {
    cursor: pointer;
    user-select: none;
  }

  .expand-icon-placeholder {
    width: 16px;
    height: 16px;
  }

  .indent {
    margin-left: 16px;
  }

  .node-name {
    overflow: hidden;
  }

  .node-name,
  .rename-input {
    flex: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 4px;
  }

  .rename-input {
    font: inherit;
    color: inherit;
    background: none;
    border: none;
    border-radius: 2px;
    outline: 1px dashed #111;
  }

  .rename-input::selection {
    background: #555;
  }
</style>
