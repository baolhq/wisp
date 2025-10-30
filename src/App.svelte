<script>
  import Sidebar from "./lib/Sidebar.svelte";
  import Editor from "./lib/Editor.svelte";
  import Appbar from "./lib/Appbar.svelte";

  let selectedFile = null;

  function handleFileSelect(file) {
    selectedFile = file;
  }
</script>

<main>
  <Appbar />
  <div class="container">
    <Sidebar bind:selectedFile onFileSelect={handleFileSelect} />
    <div class="editor-area">
      <Editor file={selectedFile} />
    </div>
  </div>
</main>

<style>
  main {
    height: 100vh;
    overflow: hidden;
  }
  .container {
    display: flex;
    height: 100%;
  }
  .editor-area {
    flex: 1;
    overflow: hidden;
  }
</style>
