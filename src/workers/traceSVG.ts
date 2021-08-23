import type { Sharp, ResizeOptions } from "sharp";

import { trace, PotraceOptions } from "potrace";

import { optimizeSVG } from "./optimizeSVG";

export interface TraceSVGParams {
  image: Sharp;
  traceOptions?: PotraceOptions;
  resizeOptions?: ResizeOptions;
}

export async function traceSVG(params: TraceSVGParams): Promise<string> {
  const { image, traceOptions = {}, resizeOptions = {} } = params;

  const resolvedTraceOptions: PotraceOptions = {
    turnPolicy: "majority",
    turdSize: 100,
    optTolerance: 0.4,
    color: "lightgray",
    background: "transparent",
    ...traceOptions,
  };

  const resolvedResizeOptions: ResizeOptions = { width: 100, ...resizeOptions };

  const buffer = await image
    .clone()
    .resize(resolvedResizeOptions)
    .png() // trace() will fail on webp images convert to png just in case
    .toBuffer();

  const tracedSVGString = await new Promise<string>((resolve, reject) => {
    trace(buffer, resolvedTraceOptions, (err, svg) => {
      if (err) reject(err);
      resolve(svg);
    });
  });

  return optimizeSVG(tracedSVGString);
}
