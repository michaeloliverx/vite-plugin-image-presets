import { basename, dirname } from "path";

import type { Post } from "$lib/types";

const modules = import.meta.globEager("/src/routes/blog/**/*.svelte.md");

export const posts: Array<Post> = Object.entries(modules).map(([filepath, module]) => {
  const slug = basename(dirname(filepath));

  const { metadata } = module;

  return {
    ...metadata,
    slug,
  };
});
