import { Sharp, FormatEnum } from "sharp";

export interface PluginConfig {
  /** The query parameter to use when scanning imports, imports without this will be ignored.
   * @default "preset"
   */
  queryParam: string;
  /** Available options are [preset], [hash], [name], [extname], [format], [width], [height]
   * @default "assets/images/[name]-[width]x[height]-[hash][extname]"
   */
  outputFileNamePattern: string;
  /**
   * Big Yoke
   *
   * @default true
   */
  presets: Record<string, PresetFn>;
}

/**
 * Metadata returned for a registered image.
 */
export interface ImageMetadata {
  src: string;
  format: keyof FormatEnum;
  size: number;
  width: number;
  height: number;
  type: string;
}

/**
 * Metadata returned for a registered image.
 */
export interface PresetParams {
  /**
   * A `Sharp` instance of the image.
   */
  image: Sharp;
  /**
   * A async function used to register a new image asset for the current import being processed.
   * Registered images are outputted in the final bundle.
   */
  registerImage(image: Sharp): Promise<ImageMetadata>;
  /**
   * An array of registered image metadata for the current import being processed.
   */
  registeredMetadata: ImageMetadata[];
}

export type RegisterImageFn = PresetParams["registerImage"];

export type PresetFn = (params: PresetParams) => unknown;
