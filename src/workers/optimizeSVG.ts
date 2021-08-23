import { optimize, extendDefaultPlugins, Plugin } from "svgo";

/**
 * Optimize an SVG string.
 */
export function optimizeSVG(svgString: string): string {
  const plugins: Plugin[] = [
    {
      name: "removeViewBox",
      active: false,
    },
    {
      name: "addAttributesToSVGElement",
      // @ts-expect-error: Silence TS error on `params`, this is correct usage.
      params: {
        attributes: [
          {
            preserveAspectRatio: "none",
          },
        ],
      },
    },
  ];
  const { data } = optimize(svgString, {
    multipass: true,
    floatPrecision: 0,
    plugins: extendDefaultPlugins(plugins),
  });
  return data;
}
