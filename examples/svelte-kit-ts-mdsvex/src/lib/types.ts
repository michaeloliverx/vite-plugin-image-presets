import type { Source } from "vite-plugin-image-presets";

export interface Post {
  slug: string;
  title: string;
  coverimage: {
    sources: Source[];
    placeholderDataURI: string;
  };
  coverimageAlt: string;
}
