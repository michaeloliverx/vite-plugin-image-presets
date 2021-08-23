import type { Sharp, ResizeOptions } from "sharp";

interface BlurredPlaceholderParams {
  /**
   * A `Sharp` instance.
   */
  image: Sharp;
  /**
   * Larger width will increase the size of the placeholder.
   * @default {width: 20}
   */
  resizeOptions?: ResizeOptions;
}

/**
 * Generate a blurred placeholder image and return base64 encoded data URI.
 */
export async function getBlurredPlaceholder(params: BlurredPlaceholderParams): Promise<string> {
  const { image, resizeOptions = {} } = params;

  const resolvedResizeOptions: ResizeOptions = { width: 10, ...resizeOptions };

  const blurredImage = image.clone().resize(resolvedResizeOptions).blur().png();
  const buffer = await blurredImage.toBuffer();
  const base64String = buffer.toString("base64");
  const dataURI = `data:image/png;base64,${base64String}`;
  return dataURI;
}
