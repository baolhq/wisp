<script>
  import { onMount } from "svelte";
  let {
    size = 24,
    strokeWidth = 2,
    isHovered = false,
    class: className = "",
  } = $props();

  let strokeColor = window
    .getComputedStyle(document.body)
    .getPropertyValue("--green");

  onMount(() => {
    isHovered = true;

    setTimeout(() => {
      isHovered = false;
    }, 500);
  });
</script>

<div class={className} aria-label="check" role="img">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={strokeColor}
    stroke-width={strokeWidth}
    stroke-linecap="round"
    stroke-linejoin="round"
    class="check-icon"
    class:animate={isHovered}
  >
    <path d="M4 12l5 5L20 6" class="check-path" />
  </svg>
</div>

<style>
  div {
    display: inline-flex;
  }
  .check-icon {
    overflow: visible;
  }

  .check-path {
    stroke-dasharray: 24;
    stroke-dashoffset: 0;
    transition:
      stroke-dashoffset 0.125s ease-out,
      opacity 0.125s ease-out;
  }

  .check-icon.animate .check-path {
    animation: checkAnimation 0.5s ease-out backwards;
  }

  @keyframes checkAnimation {
    0% {
      stroke-dashoffset: 24;
      opacity: 0;
    }
    33% {
      stroke-dashoffset: 24;
      opacity: 0;
    }
    100% {
      stroke-dashoffset: 0;
      opacity: 1;
    }
  }
</style>
