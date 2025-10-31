<script>
  import { onMount, onDestroy, tick } from "svelte";

  export let items = [];

  let show = false;
  let x = 0;
  let y = 0;
  let menu;

  function open(e) {
    e.preventDefault();
    x = e.clientX;
    y = e.clientY;
    show = true;
    tick().then(positionMenu);
  }

  function close() {
    show = false;
  }

  function handleClick(item) {
    item.action && item.action();
    close();
  }

  function handleGlobalClick(e) {
    if (!menu || menu.contains(e.target)) return;
    close();
  }

  function positionMenu() {
    const rect = menu.getBoundingClientRect();
    const pad = 8;
    let left = x;
    let top = y;

    if (left + rect.width > innerWidth - pad)
      left = innerWidth - rect.width - pad;
    if (top + rect.height > innerHeight - pad)
      top = innerHeight - rect.height - pad;

    menu.style.left = left + "px";
    menu.style.top = top + "px";
  }

  onMount(() => {
    window.addEventListener("click", handleGlobalClick);
  });

  onDestroy(() => {
    window.removeEventListener("click", close);
    window.removeEventListener("contextmenu", close);
  });
</script>

<div on:contextmenu={open} role="presentation">
  <slot></slot>

  {#if show}
    <div bind:this={menu} class="menu">
      {#each items as item}
        {#if item.text != "Divider"}
          <div
            class="menu-item"
            on:click={() => handleClick(item)}
            role="presentation"
          >
            {#if item.text == "Divider"}
              <hr class="divider" />
            {:else}
              <span class="label">{item.text}</span>
              {#if item.shortcut}
                <kbd class="shortcut">
                  {item.shortcut}
                </kbd>
              {/if}
            {/if}
          </div>
        {:else}
          <hr class="divider" />
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  .menu {
    position: fixed;
    background: #eee;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 4px;
    font-size: 14px;
    min-width: 200px;
    z-index: 99;
  }

  .menu-item {
    display: flex;
    gap: 24px;
    align-items: center;
    padding: 6px 8px;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .menu-item:hover {
    background: #ddd;
  }

  kbd.shortcut {
    margin-left: auto;
    display: flex;
    align-items: center;
    background: #ddd;
    padding: 2px 4px;
    border-radius: 4px;
  }

  .divider {
    width: calc(100% - 18px);
    border: 1px dashed #aaa;
  }
</style>
