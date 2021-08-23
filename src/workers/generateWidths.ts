import type { ImageMetadata, RegisterImageFn } from "../types";
import type { Sharp } from "sharp";

interface GenerateWidthsParams {
  image: Sharp;
  registerImage: RegisterImageFn;
  widths: number[];
}

export async function generateWidths(params: GenerateWidthsParams): Promise<ImageMetadata[]> {
  const { image, registerImage, widths } = params;

  const metadata: ImageMetadata[] = [];

  for (const width of widths) {
    const resizedImage = image.clone().resize({ width: width });
    metadata.push(await registerImage(resizedImage));
  }

  return metadata;
}
