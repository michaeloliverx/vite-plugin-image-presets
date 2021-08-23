<script lang="ts">
  import { afterUpdate } from "svelte";
  import type { Post } from "$lib/types";
  export let coverimage: Post["coverimage"];
  export let alt: string;

  let loaded = false;
  let image: HTMLImageElement;

  function handleLoad() {
    loaded = true;
  }

  /**
   * I found this helped in cases where the image had been cached by the browser.
   * Cached images didn't fire the onload event.
   */
  afterUpdate(() => {
    if (image?.complete) handleLoad();
  });
</script>

<div class:loaded>
  <img class="placeholder" src={coverimage.placeholderDataURI} {alt} />

  <picture>
    {#each coverimage.sources as { type, srcset }}
      <source {srcset} {type} />
    {/each}

    <img
      on:load={handleLoad}
      bind:this={image}
      class="main"
      src={coverimage.placeholderDataURI}
      {alt}
    />
  </picture>
</div>

<style>
  div {
    width: 80%;
    position: relative;
    margin-left: auto;
    margin-right: auto;
    padding-bottom: 50%;
  }
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    will-change: opacity;
  }
  .placeholder {
    opacity: 1;
    width: 100%;
    height: auto;
    transition: opacity 1200ms ease-out;
    transition-delay: 0.4s;
  }
  .main {
    opacity: 0;
    transition: opacity 1200ms ease-out;
    transition-delay: 0.4s;
  }
  .loaded .placeholder {
    opacity: 0;
  }
  .loaded .main {
    opacity: 1;
  }
</style>
