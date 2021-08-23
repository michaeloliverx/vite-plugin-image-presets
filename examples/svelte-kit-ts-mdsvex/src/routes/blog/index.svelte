<script lang="ts" context="module">
  import type { LoadInput, LoadOutput } from "@sveltejs/kit";

  import type { Post } from "$lib/types";

  interface Props {
    posts: Array<Post>;
  }

  export async function load({ fetch }: LoadInput): Promise<LoadOutput<Props>> {
    const url = `/blog.json`;
    const res = await fetch(url);
    if (res.ok) {
      return {
        props: {
          posts: await res.json(),
        },
      };
    }

    return {
      status: res.status,
      error: new Error(`Could not load ${url}`),
    };
  }
</script>

<script lang="ts">
  export let posts: Props["posts"];
</script>

{#each posts as { slug, title }}
  <article>
    <a href="/blog/{slug}"><h1>{title}</h1></a>
  </article>
{/each}
