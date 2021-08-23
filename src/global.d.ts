declare module "potrace" {
  export interface PotraceOptions {
    turnPolicy?: string;
    turdSize?: number;
    alphaMax?: number;
    optCurve?: boolean;
    optTolerance?: number;
    threshold?: number;
    blackOnWhite?: boolean;
    color?: string;
    background?: string;
  }
  type TraceCallback = (err: Error | null, svg: string) => unknown;
  export function trace(file: string | Buffer, options: PotraceOptions, cb: TraceCallback): void;
}
