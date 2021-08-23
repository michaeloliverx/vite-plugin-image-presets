import {
  generateWidths,
  metadataToSources,
  getBlurredPlaceholder,
  getTracedSVGPlaceholder,
} from "./workers";

import type { PresetFn } from "./types";

export const defaultPresets: Record<string, PresetFn> = {
  "srcsetPng-srcsetWebp-tracedSVGPlaceholder": async ({
    image,
    registerImage,
    registeredMetadata,
  }) => {
    const widths = [1280, 992, 768, 576, 400];

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

    const sources = metadataToSources(registeredMetadata);

    const placeholderDataURI = await getBlurredPlaceholder({ image });

    return {
      sources,
      placeholderDataURI,
    };
  },
  "srcsetPng-srcsetWebp": async ({ image, registerImage, registeredMetadata }) => {
    const widths = [1280, 992, 768, 576, 400];

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

    const sources = metadataToSources(registeredMetadata);

    const fallback = image.clone().resize({ width: 500 }).png();
    const { src, width, height } = await registerImage(fallback);
    return {
      sources,
      fallback: { src, width, height },
    };
  },
  async tracedSVGPlaceholder({ image }) {
    return await getTracedSVGPlaceholder({ image });
  },
  async blurredPlaceholder({ image }) {
    return await getBlurredPlaceholder({ image });
  },
};
