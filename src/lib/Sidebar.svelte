<script>
  import Navigator from "./Navigator.svelte";
  import List from "./List.svelte";
  import { getAllFiles } from "../utils/db.js";

  export let selectedFile = null;
  export let onFileSelect = (file) => {}; // parent callback

  let tree = [];
  let selectedFolder = null;
  let files = [];

  let sidebarWidth = 640;
  let navigatorWidth = 280;
  let listWidth = sidebarWidth - navigatorWidth;
  let resizingTarget = null;

  function buildTree(files) {
    const root = [];
    function add(path, file) {
      const parts = path.split("/");
      let current = root;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const subpath = parts.slice(0, i + 1).join("/");

        let node = current.find((n) => n.path === subpath);
        if (!node) {
          node = { name: part, path: subpath, children: [] };
          current.push(node);
        }

        const isFile = i === parts.length - 1;
        if (isFile) {
          node.content = file.content;
          delete node.children;
        } else {
          current = node.children;
        }
      }
    }
    for (const file of files) add(file.path, file);
    return root;
  }

  async function loadFromDB() {
    const all = await getAllFiles();
    tree = all.length ? buildTree(all) : [];
  }

  loadFromDB();

  function handleFolderSelect(folder) {
    selectedFolder = folder;
    files = (folder.children || []).filter((c) => !c.children);
  }

  function handleFileSelectInternal(file) {
    selectedFile = file;
    onFileSelect(file); // just call parent callback
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

<div class="sidebar" style="width: {sidebarWidth}px">
  <div class="content">
    <div class="navigator-container">
      <div class="navigator" style="width: {navigatorWidth}px">
        <Navigator
          {tree}
          onFolderSelect={handleFolderSelect}
          {selectedFolder}
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

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    background: #fafafa;
    flex-shrink: 0;
    overflow: hidden;
  }

  .content {
    height: calc(100% - 24px);
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
</style>
