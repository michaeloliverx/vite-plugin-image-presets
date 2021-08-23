import preprocess from "svelte-preprocess";
import adapter from "@sveltejs/adapter-static";
import { mdsvex } from "mdsvex";

import {
  viteImagePresets,
  metadataToSources,
  generateWidths,
  getBlurredPlaceholder,
} from "vite-plugin-image-presets";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: [".svelte", ".svelte.md"],
  preprocess: [
    mdsvex({
      extensions: [".svelte.md"],
      layout: {
        blog: "/src/layouts/blog.svelte",
      },
    }),
    preprocess(),
  ],
  kit: {
    target: "#svelte",
    adapter: adapter(),
    vite: {
      plugins: [
        viteImagePresets({
          presets: {
            async coverimage({ image, registerImage, registeredMetadata }) { 
              const widths = [1536, 1280, 992, 768, 576, 400];

              await generateWidths({
                image: image.clone().png(),
                registerImage,
                widths: widths,
              });

              await generateWidths({
                image: image.clone().webp(),
                registerImage,
                widths: widths,
              });

              return {
                sources: metadataToSources(registeredMetadata),
                placeholderDataURI: await getBlurredPlaceholder({image}),
              };
            },
          },
        }),
      ],
    },
  },
};

export default config;
