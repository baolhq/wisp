<script>
  import { onMount, onDestroy, tick } from "svelte";
  import { activeContextMenu } from "../utils/store";

  export let items = [];

  let show = false;
  let x = 0;
  let y = 0;
  let menu;

  const id = crypto.randomUUID();

  const open = async (e) => {
    e.preventDefault();
    activeContextMenu.set(id);
    x = e.clientX;
    y = e.clientY;
    show = true;
    await tick().then(positionMenu);
  };

  const close = () => {
    show = false;
    activeContextMenu.update((v) => (v === id ? null : v));
  };

  const handleClick = (item) => {
    item.action?.();
    close();
  };

  const handleGlobalClick = (e) => {
    if (!menu || menu.contains(e.target)) return;
    close();
  };

  const positionMenu = () => {
    const rect = menu.getBoundingClientRect();
    const pad = 8;
    let left = Math.min(x, innerWidth - rect.width - pad);
    let top = Math.min(y, innerHeight - rect.height - pad);
    menu.style.left = left + "px";
    menu.style.top = top + "px";
  };

  let unsubscribe;
  onMount(() => {
    unsubscribe = activeContextMenu.subscribe((v) => {
      if (v !== id) show = false;
    });
    window.addEventListener("click", handleGlobalClick);
  });

  onDestroy(() => {
    unsubscribe?.();
    window.removeEventListener("click", handleGlobalClick);
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
