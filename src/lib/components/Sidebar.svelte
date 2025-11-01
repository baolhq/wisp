<script>
  import Navigator from "./Navigator.svelte";
  import List from "./List.svelte";
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

  function buildTree(items) {
    const root = [];

    function add(path, content) {
      const parts = path.split("/").filter(Boolean);
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

  async function createEmptyNotebook(parent = null) {
    let baseName = "Untitled";
    let suffix = 1;

    // Get existing names inside parent folder
    let existingNames =
      parent?.children?.map((n) => n.name) || tree.map((n) => n.name);

    let name = baseName;
    while (existingNames.includes(name)) {
      name = `${baseName} ${suffix}`;
      suffix++;
    }

    const path = parent.path.length ? `${parent.path}/${name}` : name;

    await createNotebook(path);
    await loadFromDB();

    handleFolderSelect(parent);
  }

  async function createEmptyNote(parentFolder = null) {
    try {
      let baseName = "Untitled";
      let suffix = 1;

      // Get existing note names in the folder
      let existingNames =
        parentFolder?.children
          ?.filter((c) => !c.children)
          .map((n) => n.name.replace(/\.md$/, "")) ||
        tree.filter((n) => !n.children).map((n) => n.name.replace(/\.md$/, ""));

      let name = baseName;
      while (existingNames.includes(name)) {
        name = `${baseName} ${suffix}`;
        suffix++;
      }

      const path = parentFolder
        ? `${parentFolder.path}/${name}.md`
        : `${name}.md`;

      await createNote(path);
      await loadFromDB();

      // Select the parent folder to show the new note
      if (parentFolder) {
        handleFolderSelect(parentFolder);
      } else {
        // If no parent, select root
        files = tree.filter((n) => !n.children);
      }
    } catch (err) {
      alert(`Error creating note: ${err.message}`);
    }
  }

  function getParentFolder(notePath) {
    const parentPath = notePath.split("/").slice(0, -1).join("/");
    return parentPath ? findFolderByPath(tree, parentPath) : null;
  }

  async function handleDelete(item) {
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

      await loadFromDB();

      // Recalculate files if folder still exists
      if (selectedFolder) {
        const folder = findFolderByPath(tree, selectedFolder.path);
        if (folder) {
          handleFolderSelect(folder);
        } else {
          selectedFolder = null;
          files = [];
        }
      }
    } catch (err) {
      alert(`Error deleting: ${err.message}`);
    }
  }

  // Utility to find folder in the tree
  function findFolderByPath(nodes, path) {
    for (const node of nodes) {
      if (node.path === path) return node;
      if (node.children) {
        const found = findFolderByPath(node.children, path);
        if (found) return found;
      }
    }
    return null;
  }

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
</script>

<svelte:window on:mousemove={resize} on:mouseup={stopResize} />

<div class="sidebar {$sidebarShown ? '' : 'collapsed'}">
  <div class="content" style="opacity: {$sidebarShown ? 1 : 0}">
    <div class="navigator-container">
      <div class="navigator" style="width: {navigatorWidth}px">
        <Navigator
          nodes={tree}
          onFolderSelect={handleFolderSelect}
          {selectedFolder}
          onCreateNotebook={createEmptyNotebook}
          onCreateNote={(folder) => createEmptyNote(folder)}
          onRename={async (node, newName) => {
            const oldPath = node.path;
            const parts = oldPath.split("/");
            parts[parts.length - 1] = newName;
            const newPath = parts.join("/");

            await renameItem(oldPath, newPath);
            await loadFromDB();

            if (selectedFile?.path === oldPath) {
              selectedFile = { ...selectedFile, path: newPath, name: newName };
            }

            if (selectedFolder) {
              const folder = findFolderByPath(tree, selectedFolder.path);
              if (folder) handleFolderSelect(folder);
            }
          }}
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
          onCreateNote={(file) => {
            const parentFolder = getParentFolder(file.path);
            createEmptyNote(parentFolder);
          }}
          onRename={() => {}}
          onDelete={handleDelete}
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
    transform: scaleX(4);
    background: #555;
  }

  .resizer::before {
    content: "";
    position: absolute;
    left: -4px;
    right: -4px;
    top: 0;
    bottom: 0;
  }
</style>
