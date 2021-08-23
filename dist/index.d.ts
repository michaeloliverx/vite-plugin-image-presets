import { Plugin } from 'vite';
import { FormatEnum, Sharp, ResizeOptions } from 'sharp';
import { PotraceOptions } from 'potrace';

interface PluginConfig {
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
interface ImageMetadata {
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
interface PresetParams {
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
declare type RegisterImageFn = PresetParams["registerImage"];
declare type PresetFn = (params: PresetParams) => unknown;

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
declare function getBlurredPlaceholder(params: BlurredPlaceholderParams): Promise<string>;

interface GenerateWidthsParams {
    image: Sharp;
    registerImage: RegisterImageFn;
    widths: number[];
}
declare function generateWidths(params: GenerateWidthsParams): Promise<ImageMetadata[]>;

interface Source {
    /** MIME media type of the image. */
    type: string;
    /** Comma seperated list of images. */
    srcset: string;
}
/**
 * Takes a list of image metadata and returns a list of objects that include
 * that are suitable to be used inside the <source> element.
 */
declare function metadataToSources(metadata: ImageMetadata[]): Source[];

/**
 * Optimize an SVG string.
 */
declare function optimizeSVG(svgString: string): string;

interface TraceSVGParams {
    image: Sharp;
    traceOptions?: PotraceOptions;
    resizeOptions?: ResizeOptions;
}
declare function traceSVG(params: TraceSVGParams): Promise<string>;

declare function getTracedSVGPlaceholder(params: TraceSVGParams): Promise<string>;

declare function viteImagePresets(userOptions?: Partial<PluginConfig>): Plugin;

export { ImageMetadata, PluginConfig, PresetFn, PresetParams, RegisterImageFn, Source, TraceSVGParams, generateWidths, getBlurredPlaceholder, getTracedSVGPlaceholder, metadataToSources, optimizeSVG, traceSVG, viteImagePresets };
