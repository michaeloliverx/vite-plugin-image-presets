# vite-plugin-image-presets

Load and transform images using presets.

## Usage

```ts
import image from "./images/example.jpg?preset=coverimage";
console.log(image);
```

```json
{
  "sources": [
    {
      "type": "image/png",
      "srcset": "/@vite-plugin-image-presets/assets/images/example-1280x766-4ba29e7c.png 1280w, /@vite-plugin-image-presets/assets/images/example-992x594-4c0a21fc.png 992w, /@vite-plugin-image-presets/assets/images/example-768x460-870d9dea.png 768w, /@vite-plugin-image-presets/assets/images/example-576x345-ea2c82b8.png 576w, /@vite-plugin-image-presets/assets/images/example-400x239-ab9e82d9.png 400w"
    },
    {
      "type": "image/webp",
      "srcset": "/@vite-plugin-image-presets/assets/images/example-1280x766-57f7e695.webp 1280w, /@vite-plugin-image-presets/assets/images/example-992x594-ad95768d.webp 992w, /@vite-plugin-image-presets/assets/images/example-768x460-221a3c8a.webp 768w, /@vite-plugin-image-presets/assets/images/example-576x345-a4be77b8.webp 576w, /@vite-plugin-image-presets/assets/images/example-400x239-d81cd021.webp 400w"
    }
  ],
  "placeholderDataURI": "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20100%2060'%3e%3cpath%20d='m71%201%205%203c6%202%207%205%204%209s-3%206%201%207c3%201%201%204-3%204l-6%202c-7%203-11%203-14%201-1-2-2-2-2-1h-3l-3-2-15-4-5-1c-1%200-2%200-1%201l2%202%201%202c-1-1-5%202-4%204%200%202-1%201-4-1l-2-2c2%200%200-1-5-4l-8-1-4-2-2-1h2c2%201%202%201%201-1l-1-1H4c1-1-2-4-3-4-2%200-1%204%200%204v9h3l1%201%201%201%203%201-1%202-1%203c0%202%204%204%205%202s1-2%204%200c1%202%204%203%205%203%204%201%208%206%206%207l-5-1c-3-2-3-2-5%200H8l-2%201%201-2v-1c-2%200-4%201-4%203H2c-2%200-2%201-2%208v8h101V43l-3%201-9%201c-8-1-9%200-9%202l-1%202-1-2v-3c1%200%203-1%203-3l2-1a896%20896%200%200%200%2011%202l6%201v-8a843%20843%200%200%201%200-28V0H85C72%200%2070%200%2071%201M42%2034c5%204%2013%208%2015%208l3%201H48l-3%201%204%202c5%202%206%202%206%200l2-1%206%202c5%200%205%200%202-1l-3-3v-1c-2%200-5-4-5-6%200-3-6-5-7-2h-5c-5-2-6-2-3%200'%20fill='%23d3d3d3'%20fill-rule='evenodd'/%3e%3c/svg%3e"
}
```

The `preset=coverimage` query paramater is the important part. The value `coverimage` maps directly to a preset handler defined in the plugin config.

```ts
import { defineConfig } from "vite";
import {
  viteImagePresets,
  metadataToSources,
  generateWidths,
  getBlurredPlaceholder,
} from "vite-plugin-image-presets";

export default defineConfig({
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
            placeholderDataURI: await getBlurredPlaceholder({ image }),
          };
        },
      },
    }),
  ],
});
```

## TypeScript

Create a `vite-plugin-image-presets.d.ts` file with the following:

```ts
declare module "*preset=coverimage" {
  import type { Source } from "vite-plugin-image-presets";
  export const sources: Source[];
  export const placeholderDataURI: string;
  const _default = { sources, placeholderDataURI };
  export default _default;
}
```

## Examples

- [examples/svelte-kit-ts-mdsvex](examples/svelte-kit-ts-mdsvex)

- [vanilla-ts](examples/vanilla-ts)
