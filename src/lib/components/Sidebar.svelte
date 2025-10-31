<script>
  import Navigator from "./Navigator.svelte";
  import List from "./List.svelte";
  import Modal from "./Modal.svelte";
  import {
    getAll,
    createNotebook,
    createNote,
    deleteItem,
    renameItem,
  } from "../utils/db.js";
  import { sidebarShown } from "../utils/store";

  export let selectedFile = null;
  export let onFileSelect;

  let tree = [];
  let selectedFolder = null;
  let files = [];

  let sidebarWidth = 640;
  let navigatorWidth = 280;
  let listWidth = sidebarWidth - navigatorWidth;
  let resizingTarget = null;

  // Modal state
  let showModal = false;
  let modalType = ""; // "notebook", "note", "rename"
  let modalTitle = "";
  let inputValue = "";
  let currentTarget = null; // for rename/delete operations

  function buildTree(items) {
    const root = [];

    function add(path, content) {
      const parts = path.split("/").filter(Boolean); // remove empty strings
      let current = root;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const subpath = parts.slice(0, i + 1).join("/");

        let node = current.find((n) => n.path === subpath);
        if (!node) {
          node = { name: part, path: subpath, children: [] };
          current.push(node);
        }

        const isLast = i === parts.length - 1;

        // Only assign content if this is a file (has content)
        if (content && isLast) {
          node.content = content;
          delete node.children; // mark as file
        } else {
          current = node.children; // go deeper for folders
        }
      }
    }

    for (const item of items) {
      add(item.path, item.content);
    }

    return root;
  }

  async function loadFromDB() {
    const all = await getAll();
    tree = all.length ? buildTree(all) : [];
  }

  loadFromDB();

  function handleFolderSelect(folder) {
    selectedFolder = folder;
    files = (folder.children || []).filter((c) => !c.children);
  }

  function handleFileSelectInternal(file) {
    selectedFile = file;
    onFileSelect(file);
  }

  // Modal handlers
  function openNewNotebookModal() {
    modalType = "notebook";
    modalTitle = "Create New Notebook";
    inputValue = "";
    showModal = true;
  }

  function openNewNoteModal(parentFolder = null) {
    modalType = "note";
    modalTitle = "Create New Note";
    inputValue = "";
    currentTarget = parentFolder;
    showModal = true;
  }

  function openRenameModal(item) {
    modalType = "rename";
    modalTitle = "Rename";
    inputValue = item.name;
    currentTarget = item;
    showModal = true;
  }

  async function handleModalConfirm() {
    if (!inputValue.trim()) return;

    try {
      if (modalType === "notebook") {
        const path = inputValue.trim();
        await createNotebook(path);
      } else if (modalType === "note") {
        const parentPath = currentTarget?.path || "";
        const notePath = parentPath
          ? `${parentPath}/${inputValue.trim()}.md`
          : `${inputValue.trim()}.md`;
        await createNote(notePath);
      } else if (modalType === "rename") {
        const oldPath = currentTarget.path;
        const pathParts = oldPath.split("/");
        pathParts[pathParts.length - 1] = inputValue.trim();
        const newPath = pathParts.join("/");
        await renameItem(oldPath, newPath);

        // If the renamed item was selected, update selection
        if (selectedFile?.path === oldPath) {
          selectedFile = {
            ...selectedFile,
            path: newPath,
            name: inputValue.trim(),
          };
        }
      }

      await loadFromDB();
      showModal = false;
      inputValue = "";
      currentTarget = null;
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  }

  async function handleDelete(item) {
    const confirmed = confirm(`Delete "${item.name}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteItem(item.path);

      // Clear selection if deleted item was selected
      if (
        selectedFile?.path === item.path ||
        selectedFile?.path.startsWith(item.path + "/")
      ) {
        selectedFile = null;
        onFileSelect(null);
      }
      if (
        selectedFolder?.path === item.path ||
        selectedFolder?.path.startsWith(item.path + "/")
      ) {
        selectedFolder = null;
        files = [];
      }

      await loadFromDB();
    } catch (err) {
      alert(`Error deleting: ${err.message}`);
    }
  }

  // Expose these functions to Navigator via props
  export const actions = {
    createNotebook: openNewNotebookModal,
    createNote: openNewNoteModal,
    rename: openRenameModal,
    delete: handleDelete,
  };

  function startResize(target, e) {
    resizingTarget = target;
    e.preventDefault();
  }

  function resize(e) {
    if (!resizingTarget) return;

    if (resizingTarget === "sidebar") {
      const newSidebar = Math.max(350, e.clientX);
      sidebarWidth = newSidebar;
      listWidth = sidebarWidth - navigatorWidth - 8;
    }

    if (resizingTarget === "navigator") {
      const newNav = Math.max(150, Math.min(e.clientX, sidebarWidth - 150));
      const delta = newNav - navigatorWidth;
      navigatorWidth = newNav;
      sidebarWidth += delta;
    }
  }

  function stopResize() {
    resizingTarget = null;
  }

  function handleKeydown(e) {
    if (showModal && e.key === "Enter") {
      handleModalConfirm();
    }
  }
</script>

<svelte:window
  on:mousemove={resize}
  on:mouseup={stopResize}
  on:keydown={handleKeydown}
/>

<div class="sidebar {$sidebarShown ? '' : 'collapsed'}">
  <div class="content" style="opacity: {$sidebarShown ? 1 : 0}">
    <div class="navigator-container">
      <div class="navigator" style="width: {navigatorWidth}px">
        <Navigator
          nodes={tree}
          onFolderSelect={handleFolderSelect}
          {selectedFolder}
          onCreateNotebook={openNewNotebookModal}
          onCreateNote={openNewNoteModal}
          onRename={openRenameModal}
          onDelete={handleDelete}
        />
      </div>
      <div
        class="resizer"
        class:resizing={resizingTarget === "navigator"}
        on:mousedown={(e) => startResize("navigator", e)}
        role="presentation"
      ></div>
    </div>

    <div class="list-container" style="width: {listWidth}px">
      <div class="list-panel">
        <List
          items={files}
          onSelect={handleFileSelectInternal}
          {selectedFile}
        />
      </div>
      <div
        class="resizer"
        class:resizing={resizingTarget === "sidebar"}
        on:mousedown={(e) => startResize("sidebar", e)}
        role="presentation"
      ></div>
    </div>
  </div>
</div>

<Modal
  bind:show={showModal}
  title={modalTitle}
  on:close={() => (showModal = false)}
>
  <div class="modal-content">
    <label for="item-name">
      {modalType === "notebook"
        ? "Notebook path:"
        : modalType === "note"
          ? "Note name:"
          : "New name:"}
    </label>
    <input
      id="item-name"
      type="text"
      bind:value={inputValue}
      placeholder={modalType === "notebook"
        ? "e.g., Work/Projects"
        : modalType === "note"
          ? "e.g., Meeting Notes"
          : ""}
    />
    {#if modalType === "note" && currentTarget}
      <p class="hint">Will be created in: {currentTarget.path}/</p>
    {/if}
  </div>

  <div slot="footer">
    <button class="btn btn-secondary" on:click={() => (showModal = false)}
      >Cancel</button
    >
    <button class="btn btn-primary" on:click={handleModalConfirm}>
      {modalType === "rename" ? "Rename" : "Create"}
    </button>
  </div>
</Modal>

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    background: #fafafa;
    flex-shrink: 0;
    overflow: hidden;
    transition: margin 0.25s ease;
    margin-left: 0;
  }

  .sidebar.collapsed {
    width: 640px;
    margin-left: -640px;
  }

  .sidebar.collapsed .content {
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }

  .content {
    opacity: 1;
    height: calc(100% - 24px);
    transition: opacity 0.2s ease;
    display: flex;
  }

  .navigator {
    overflow-y: auto;
    flex: 0 0 auto;
  }

  .navigator-container,
  .list-container {
    display: flex;
    height: 100%;
  }

  .list-panel {
    flex: 1;
    overflow-y: auto;
  }

  .resizer {
    width: 1px;
    cursor: col-resize;
    background: #eee;
    flex-shrink: 0;
    position: relative;
    transition: all 0.5s ease;
  }

  .resizer:hover,
  .resizer.resizing {
    transform: scale(6);
    background: #aaf;
  }

  .resizer::before {
    content: "";
    position: absolute;
    left: -4px;
    right: -4px;
    top: 0;
    bottom: 0;
  }

  .modal-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .modal-content label {
    font-weight: 600;
    font-size: 14px;
  }

  .modal-content input {
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.2s;
  }

  .modal-content input:focus {
    outline: none;
    border-color: #2563eb;
  }

  .hint {
    font-size: 12px;
    color: #666;
    margin: 0;
  }

  .btn {
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primary {
    background: #2563eb;
    color: white;
  }

  .btn-primary:hover {
    background: #1d4ed8;
  }

  .btn-secondary {
    background: #f3f4f6;
    color: #374151;
  }

  .btn-secondary:hover {
    background: #e5e7eb;
  }
</style>
