import { groupBy } from "lodash";
import type { ImageMetadata } from "../types";

export interface Source {
  /** MIME media type of the image. */
  type: string;
  /** Comma seperated list of images. */
  srcset: string;
}

/**
 * Takes a list of image metadata and returns a list of objects that include
 * that are suitable to be used inside the <source> element.
 */
export function metadataToSources(metadata: ImageMetadata[]): Source[] {
  const types = groupBy(metadata, "type");
  return Object.keys(types).map((type) => {
    return {
      type,
      srcset: types[type].map((m) => `${m.src} ${m.width}w`).join(", "),
    };
  });
}
