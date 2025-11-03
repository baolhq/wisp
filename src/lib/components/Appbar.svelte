<script>
  import hotkeys from "hotkeys-js";
  import Icon from "@iconify/svelte";
  import Spinner from "./Spinner.svelte";
  import { sidebarShown, autosaving } from "../utils/store";
  import Check from "./Check.svelte";

  hotkeys("ctrl+\\", toggleSidebar);

  function toggleSidebar() {
    sidebarShown.update((s) => !s);
  }
</script>

<div class="appbar">
  <div class="left">
    <button
      class="toggle-sidebar-btn"
      title="Toggle sidebar (Ctrl+\)"
      on:click={() => toggleSidebar()}
    >
      <Icon icon="mynaui:sidebar" width="24" height="24" />
    </button>
    <button class="autosave-btn" title={$autosaving ? "Saving.." : "Autosaved"}>
      {#if $autosaving}
        <Spinner size={24} duration={1.8} />
      {:else}
        <Check />
      {/if}
    </button>
  </div>
  <div class="center">
    <button class="back-btn active" title="Go Back (Alt+LeftArrow)">
      <Icon icon="mynaui:arrow-left" width="18" height="18" />
    </button>
    <button class="forward-btn" title="Go Forward (Alt+RightArrow)">
      <Icon icon="mynaui:arrow-right" width="18" height="18" />
    </button>
    <button class="title-btn" title="Lorem ipsum dolor sit amet">
      Lorem ipsum...
    </button>
    <button class="search-btn" title="Quick Search (Ctrl+P)">
      <Icon icon="mynaui:search" width="18" height="18" />
    </button>
  </div>
  <div class="right">
    <button class="focus-btn" title="Focus Mode (Ctrl+.)">
      <Icon icon="mynaui:circle-dashed" width="24" height="24" />
    </button>
    <button class="bookmark-btn" title="Bookmark Current (Ctrl+Shift+B)">
      <Icon icon="mynaui:bookmark" width="24" height="24" />
    </button>
    <button class="bookmark-btn" title="Preferences (Ctrl+,)">
      <Icon icon="mynaui:cog-two" width="24" height="24" />
    </button>
  </div>
</div>

<style>
  .appbar {
    width: calc(100% - 16px);
    height: 24px;
    background: var(--bg);
    color: var(--fg);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    border-bottom: 1px solid var(--border);
  }

  .left,
  .right,
  .center {
    height: 100%;
    width: 20%;
    display: flex;
    align-items: center;
  }

  .center {
    width: 60%;
    justify-content: center;
  }

  .right {
    justify-content: right;
  }

  button {
    outline: none;
    border: none;
    background: none;
    border-radius: 8px;
    display: grid;
    place-content: center;
    padding: 2px;
    margin: 0 4px;
    color: var(--fg);
  }

  .back-btn,
  .forward-btn {
    color: var(--fg-dim-3);
  }

  .back-btn:hover,
  .forward-btn:hover {
    cursor: default;
    background: none;
  }

  button:hover,
  .active:hover {
    cursor: pointer;
    background: var(--border);
  }

  .active {
    color: var(--fg);
  }

  .title-btn {
    width: 50%;
    padding: 4px;
    border: 1px solid var(--border);
    color: var(--fg-dim-2);
    border-radius: 8px;
  }

  .title-btn:hover {
    border: 1px solid var(--fg-dim-2);
    color: var(--fg-dim-1);
  }
</style>
