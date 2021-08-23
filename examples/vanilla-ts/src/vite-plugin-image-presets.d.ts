declare module "*preset=srcsetPng-srcsetWebp" {
  import type { Source } from "vite-plugin-image-presets";
  export interface Metadata {
    sources: Source[];
    fallback: { src: string; width: number; height: number };
  }
  export const sources: Metadata["sources"];
  export const fallback: Metadata["fallback"];
  const _default: Metadata;
  export default _default;
}
