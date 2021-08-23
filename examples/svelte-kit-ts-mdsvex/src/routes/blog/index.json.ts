import type { EndpointOutput } from "@sveltejs/kit";

import { posts } from "./_posts";

export async function get(): Promise<EndpointOutput> {
  return {
    body: JSON.stringify(posts),
  };
}
