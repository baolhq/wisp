<script>
  export let size = 48;
  export let duration = 2;
</script>

<span
  class="loader"
  style="
    --size: {size}px;
    --duration: {duration}s;
  "
></span>

<style>
  .loader {
    width: var(--size);
    height: var(--size);
    display: inline-block;
    position: relative;
  }

  .loader::before,
  .loader::after {
    content: "";
    box-sizing: border-box;
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    background: var(--green);
    position: absolute;
    left: 0;
    top: 0;
    animation: ripple var(--duration) linear infinite;
  }

  .loader::before,
  .loader::after {
    animation-delay: calc(var(--duration) / -2);
  }
  .loader::after {
    animation-delay: 0s;
  }

  @keyframes ripple {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .loader::before,
    .loader::after {
      animation: none;
      opacity: 0.8;
      transform: scale(0.6);
    }
  }
</style>
