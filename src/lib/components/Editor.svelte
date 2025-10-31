<script>
  import { onMount } from "svelte";
  import EditorJS from "@editorjs/editorjs";
  import Header from "@editorjs/header";
  import Table from "@editorjs/table";
  import Quote from "@editorjs/quote";

  import { getFile, saveFiles } from "../utils/db.js";
  import { autosaving } from "../utils/store.js";

  export let file;

  let editor;
  let saveTimer;

  async function loadContent() {
    if (!file?.path) return { blocks: [] };
    const existing = await getFile(file.path);

    return (
      existing?.content || {
        blocks: [
          {
            type: "header",
            data: { text: "New file", level: 2 },
          },
        ],
      }
    );
  }

  async function initEditor() {
    const data = await loadContent();

    editor = new EditorJS({
      holder: "editorjs",
      autofocus: true,
      tools: {
        header: Header,
        table: Table,
        quote: Quote,
      },
      data,
      async onChange() {
        triggerSave();
      },
    });
  }

  function triggerSave() {
    clearTimeout(saveTimer);

    // slight debounce so every keystroke doesn't flicker autosave UI
    saveTimer = setTimeout(async () => {
      if (!editor || !file?.path) return;

      autosaving.set(true); // ✅ start autosave indicator

      const output = await editor.save();
      await saveFiles([{ path: file.path, content: output }]);

      autosaving.set(false); // ✅ done saving
    }, 500);
  }

  async function setup() {
    if (!file?.path) return;

    if (editor) {
      try {
        await editor.destroy();
      } catch {}
      editor = null;
    }

    await initEditor();
  }

  onMount(setup);

  // handle switching files
  $: if (file) setup();

  // cleanup if component unmounts
  $: if (!file && editor) {
    try {
      editor.destroy();
    } catch {}
    editor = null;
  }
</script>

<div class="editor-container">
  <div id="editorjs"></div>
</div>

<style>
  .editor-container {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  #editorjs {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
  }
</style>
