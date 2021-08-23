import svgToTinyDataUri from "mini-svg-data-uri";
import { traceSVG, TraceSVGParams } from "./traceSVG";

export async function getTracedSVGPlaceholder(params: TraceSVGParams): Promise<string> {
  const tracedSVGString = await traceSVG(params);
  const dataURI = svgToTinyDataUri.toSrcset(tracedSVGString);
  return dataURI;
}
