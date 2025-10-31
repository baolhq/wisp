<script>
  import Icon from "@iconify/svelte";
  import Spinner from "./Spinner.svelte";
  import { sidebarShown, autosaving } from "../utils/store";

  function toggleSidebar() {
    sidebarShown.update((s) => !s);
  }
</script>

<div class="appbar">
  <div class="left">
    <button
      class="toggle-sidebar-btn"
      title="Toggle sidebar"
      on:click={() => toggleSidebar()}
    >
      <Icon icon="mynaui:sidebar" width="24" height="24" />
    </button>
    <button class="autosave-btn" title={$autosaving ? "Saving.." : "Autosaved"}>
      {#if $autosaving}
        <Spinner size={24} color="#22c55e" duration={1.8} />
      {:else}
        <Icon icon="mynaui:smile-square" width="24" height="24" />
      {/if}
    </button>
  </div>
  <div class="center">
    <button class="back-btn active" title="Go back">
      <Icon icon="mynaui:arrow-left" width="18" height="18" />
    </button>
    <button class="next-btn" title="Go next">
      <Icon icon="mynaui:arrow-right" width="18" height="18" />
    </button>
    <button class="title-btn" title="Lorem ipsum dolor sit amet">
      Lorem ipsum...
    </button>
    <button class="search-btn" title="Search anything">
      <Icon icon="mynaui:search" width="24" height="24" />
    </button>
  </div>
  <div class="right">
    <button class="focus-btn" title="Focus mode">
      <Icon icon="mynaui:circle-dashed" width="24" height="24" />
    </button>
    <button class="bookmark-btn" title="Bookmark current note">
      <Icon icon="mynaui:bookmark" width="24" height="24" />
    </button>
    <button class="bookmark-btn" title="Preferences">
      <Icon icon="mynaui:cog-two" width="24" height="24" />
    </button>
  </div>
</div>

<style>
  .appbar {
    width: calc(100% - 21px);
    height: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #eee;
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
    transition: all 0.5s ease;
    border-radius: 8px;
    display: grid;
    place-content: center;
    padding: 4px;
    margin: 0 4px;
  }

  button:hover,
  .active:hover {
    cursor: pointer;
    background: #eee;
  }

  .back-btn,
  .next-btn {
    color: #aaa;
  }

  .active {
    color: inherit;
  }

  .title-btn {
    width: 50%;
    padding: 4px;
    border: 1px solid #aaa;
    border-radius: 8px;
    transition: all 0.5s ease;
  }

  .title-btn:hover {
    border: 1px solid black;
  }
</style>
