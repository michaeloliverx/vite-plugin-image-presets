declare module "*preset=coverimage" {
  import type { Source } from "vite-plugin-image-presets";
  export const sources: Source[];
  export const placeholderDataURI: string;
  const _default = { sources, placeholderDataURI };
  export default _default;
}
