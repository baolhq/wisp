<script>
  import Sidebar from "./lib/components/Sidebar.svelte";
  import Editor from "./lib/components/Editor.svelte";
  import Appbar from "./lib/components/Appbar.svelte";

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
    max-width: 800px;
    margin: 0 auto;
  }
</style>
