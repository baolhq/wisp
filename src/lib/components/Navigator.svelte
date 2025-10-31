<script>
  import Icon from "@iconify/svelte";
  import ContextMenu from "./ContextMenu.svelte";

  export let nodes = [];
  export let onFolderSelect;
  export let selectedFolder;

  const notebookMenuItems = [
    {
      text: "New Note",
      shortcut: "Ctrl+N",
      action: () => alert("New Note"),
    },
    {
      text: "New Notebook",
      shortcut: "Ctrl+Shift+N",
      action: () => alert("New Notebook"),
    },
    {
      text: "Rename",
      shortcut: "Ctrl+R",
      action: () => alert("Rename"),
    },
    { text: "Divider" },
    {
      text: "Delete",
      shortcut: "Delete",
      action: () => alert("Delete"),
    },
  ];

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

{#each nodes as node}
  {#if isFolder(node)}
    <ContextMenu items={notebookMenuItems}>
      <div>
        <button
          class="row"
          class:selected={selectedFolder === node}
          on:click={() => onFolderSelect && onFolderSelect(node)}
        >
          {#if hasSubFolders(node)}
            <span
              id="notebook-ico"
              role="presentation"
              on:click|stopPropagation={() => toggle(node)}
            >
              <Icon icon="mynaui:book" width="24" height="24" />
            </span>
          {:else}
            <Icon icon="mynaui:book" width="24" height="24" />
          {/if}

          {node.name}
        </button>

        {#if expanded.has(node)}
          <div class="indent">
            <svelte:self
              tree={node.children}
              {onFolderSelect}
              {selectedFolder}
            />
          </div>
        {/if}
      </div>
    </ContextMenu>
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

  #notebook-ico {
    display: inline-flex;
    justify-content: center;
    cursor: pointer;
    user-select: none;
  }

  #notebook-ico:hover {
    color: rgba(59, 130, 246, 0.7);
  }

  .indent {
    margin-left: 20px;
  }
</style>
