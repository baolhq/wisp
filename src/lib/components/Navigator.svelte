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
  export let isRoot = true; // Flag to identify root level

  let renameInput;
  let editing = null;
  let tempName = "";

  async function startRename(node) {
    editing = node;
    tempName = node.name;

    await tick(); // wait for input to render
    renameInput && renameInput.focus();
    renameInput && renameInput.select();
  }

  function cancelRename() {
    editing = null;
  }

  async function commitRename() {
    if (!tempName.trim() || !editing || tempName === editing.name) {
      cancelRename();
      return;
    }

    await onRename(editing, tempName.trim());
    cancelRename();
  }

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
    return node.children != undefined;
  }

  function hasSubFolders(node) {
    return node.children && node.children.length;
  }

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
        action: () => onCreateNotebook(node),
      },
      {
        text: "Rename",
        shortcut: "F2",
        action: () => startRename(node),
      },
      { text: "Divider" },
      {
        text: "Delete",
        shortcut: "Delete",
        action: () => onDelete(node),
      },
    ];
  }

  function ascendingByName(a, b) {
    if (a.path < b.path) return -1;
    else if (a.path > b.path) return 1;
    return 0;
  }
</script>

{#if isRoot}
  <div class="navigator-root">
    <div class="header">
      <span class="title">Notebooks</span>
      <button
        class="add-btn"
        on:click={() => onCreateNotebook({ path: "" })}
        title="Create new notebook"
      >
        <Icon icon="mynaui:plus" width="20" height="20" />
      </button>
    </div>

    <div class="tree-container">
      {#if nodes.length === 0}
        <div class="empty-state">
          <p>No notebooks yet</p>
          <button class="create-first-btn" on:click={onCreateNotebook}>
            <Icon icon="mynaui:plus" width="16" height="16" />
            Create your first notebook
          </button>
        </div>
      {:else}
        {#each nodes.sort(ascendingByName) as node}
          {#if isFolder(node)}
            <ContextMenu items={getMenuItems(node)}>
              <div>
                <button
                  class="row"
                  class:selected={selectedFolder === node}
                  on:click={() => onFolderSelect && onFolderSelect(node)}
                >
                  {#if hasSubFolders(node)}
                    <span
                      class="expand-icon"
                      role="presentation"
                      on:click|stopPropagation={() => toggle(node)}
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
                      spellcheck="false"
                      bind:this={renameInput}
                      bind:value={tempName}
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
                      isRoot={false}
                    />
                  </div>
                {/if}
              </div>
            </ContextMenu>
          {/if}
        {/each}
      {/if}
    </div>
  </div>
{:else}
  <!-- Recursive rendering for nested nodes -->
  {#each nodes as node}
    {#if isFolder(node)}
      <ContextMenu items={getMenuItems(node)}>
        <div>
          <button
            class="row"
            class:selected={selectedFolder === node}
            on:click={() => onFolderSelect && onFolderSelect(node)}
          >
            {#if hasSubFolders(node)}
              <span
                class="expand-icon"
                role="presentation"
                on:click|stopPropagation={() => toggle(node)}
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
            <span class="node-name">{node.name}</span>
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
                isRoot={false}
              />
            </div>
          {/if}
        </div>
      </ContextMenu>
    {/if}
  {/each}
{/if}

<style>
  .navigator-root {
    padding: 8px 0;
  }

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

  .add-btn {
    all: unset;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    transition: all 0.2s;
    color: #666;
  }

  .add-btn:hover {
    background: rgba(0, 0, 0, 0.06);
    color: #2563eb;
  }

  .tree-container {
    min-height: 100px;
  }

  .empty-state {
    padding: 32px 16px;
    text-align: center;
    color: #999;
  }

  .empty-state p {
    margin: 0 0 16px 0;
    font-size: 14px;
  }

  .create-first-btn {
    all: unset;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: #2563eb;
    color: white;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .create-first-btn:hover {
    background: #1d4ed8;
  }

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

  .expand-icon {
    display: inline-flex;
    justify-content: center;
    align-items: center;
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
    outline: 1px dashed #111;
    border-radius: 2px;
    border: none;
  }

  .rename-input::selection {
    background: #555;
  }
</style>
