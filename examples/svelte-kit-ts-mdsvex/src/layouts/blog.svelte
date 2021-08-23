<!--
  Using JSDoc for types here because TS inside layout files is unsupported.
  Tracked at https://github.com/pngwn/MDsveX/issues/116
-->
<script>
  import CoverImage from "$lib/CoverImage.svelte";
  /** @type {string} */
  export let title;
  /** @type {import("$lib/types").Post["coverimage"]} */
  export let coverimage;
  /** @type {string} */
  export let coverimageAlt;
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<h1>{title}</h1>

<CoverImage {coverimage} alt={coverimageAlt} />

<slot />
