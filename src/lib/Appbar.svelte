<script>
  import Icon from "@iconify/svelte";
</script>

<div class="appbar">
  <div class="left">
    <button class="toggle-sidebar-btn" title="Toggle sidebar">
      <Icon icon="mynaui:sidebar-alt-solid" width="24" height="24" />
    </button>
    <button class="back-btn" title="Go back">
      <Icon icon="mynaui:arrow-left" width="18" height="18" />
    </button>
    <button class="next-btn" title="Go next">
      <Icon icon="mynaui:arrow-right" width="18" height="18" />
    </button>
  </div>
  <div class="center">
    <button class="title-btn" title="Lorem ipsum dolor sit amet">
      Lorem ipsum...
    </button>
  </div>
  <div class="right">
    <button class="search-btn" title="Global search">
      <Icon icon="mynaui:search" width="24" height="24" />
    </button>
    <button class="focus-btn" title="Focus mode">
      <Icon icon="mynaui:center-focus-solid" width="24" height="24" />
    </button>
    <button class="bookmark-btn" title="Bookmark current note">
      <Icon icon="mynaui:bookmark" width="24" height="24" />
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
  }

  button:hover {
    cursor: pointer;
    color: rgb(93, 93, 255);
  }

  .back-btn,
  .next-btn {
    color: #aaa;
  }
</style>
