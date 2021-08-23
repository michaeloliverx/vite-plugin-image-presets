var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};

// src/index.ts
import { parse, join } from "path";
import chalk from "chalk";
import sharp from "sharp";
import { dataToEsm } from "@rollup/pluginutils";
import { createHash } from "crypto";

// src/workers/bluredPlaceholder.ts
async function getBlurredPlaceholder(params) {
  const { image, resizeOptions = {} } = params;
  const resolvedResizeOptions = __spreadValues({ width: 10 }, resizeOptions);
  const blurredImage = image.clone().resize(resolvedResizeOptions).blur().png();
  const buffer = await blurredImage.toBuffer();
  const base64String = buffer.toString("base64");
  const dataURI = `data:image/png;base64,${base64String}`;
  return dataURI;
}

// src/workers/generateWidths.ts
async function generateWidths(params) {
  const { image, registerImage, widths } = params;
  const metadata = [];
  for (const width of widths) {
    const resizedImage = image.clone().resize({ width });
    metadata.push(await registerImage(resizedImage));
  }
  return metadata;
}

// src/workers/metadataToSources.ts
import { groupBy } from "lodash";
function metadataToSources(metadata) {
  const types = groupBy(metadata, "type");
  return Object.keys(types).map((type) => {
    return {
      type,
      srcset: types[type].map((m) => `${m.src} ${m.width}w`).join(", ")
    };
  });
}

// src/workers/optimizeSVG.ts
import { optimize, extendDefaultPlugins } from "svgo";
function optimizeSVG(svgString) {
  const plugins = [
    {
      name: "removeViewBox",
      active: false
    },
    {
      name: "addAttributesToSVGElement",
      params: {
        attributes: [
          {
            preserveAspectRatio: "none"
          }
        ]
      }
    }
  ];
  const { data } = optimize(svgString, {
    multipass: true,
    floatPrecision: 0,
    plugins: extendDefaultPlugins(plugins)
  });
  return data;
}

// src/workers/traceSVG.ts
import { trace } from "potrace";
async function traceSVG(params) {
  const { image, traceOptions = {}, resizeOptions = {} } = params;
  const resolvedTraceOptions = __spreadValues({
    turnPolicy: "majority",
    turdSize: 100,
    optTolerance: 0.4,
    color: "lightgray",
    background: "transparent"
  }, traceOptions);
  const resolvedResizeOptions = __spreadValues({ width: 100 }, resizeOptions);
  const buffer = await image.clone().resize(resolvedResizeOptions).png().toBuffer();
  const tracedSVGString = await new Promise((resolve, reject) => {
    trace(buffer, resolvedTraceOptions, (err, svg) => {
      if (err)
        reject(err);
      resolve(svg);
    });
  });
  return optimizeSVG(tracedSVGString);
}

// src/workers/tracedSVGPlaceholder.ts
import svgToTinyDataUri from "mini-svg-data-uri";
async function getTracedSVGPlaceholder(params) {
  const tracedSVGString = await traceSVG(params);
  const dataURI = svgToTinyDataUri.toSrcset(tracedSVGString);
  return dataURI;
}

// src/presets.ts
var defaultPresets = {
  "srcsetPng-srcsetWebp-tracedSVGPlaceholder": async ({
    image,
    registerImage,
    registeredMetadata
  }) => {
    const widths = [1280, 992, 768, 576, 400];
    await generateWidths({
      image: image.clone().png(),
      registerImage,
      widths
    });
    await generateWidths({
      image: image.clone().webp(),
      registerImage,
      widths
    });
    const sources = metadataToSources(registeredMetadata);
    const placeholderDataURI = await getBlurredPlaceholder({ image });
    return {
      sources,
      placeholderDataURI
    };
  },
  "srcsetPng-srcsetWebp": async ({ image, registerImage, registeredMetadata }) => {
    const widths = [1280, 992, 768, 576, 400];
    await generateWidths({
      image: image.clone().png(),
      registerImage,
      widths
    });
    await generateWidths({
      image: image.clone().webp(),
      registerImage,
      widths
    });
    const sources = metadataToSources(registeredMetadata);
    const fallback = image.clone().resize({ width: 500 }).png();
    const { src, width, height } = await registerImage(fallback);
    return {
      sources,
      fallback: { src, width, height }
    };
  },
  async tracedSVGPlaceholder({ image }) {
    return await getTracedSVGPlaceholder({ image });
  },
  async blurredPlaceholder({ image }) {
    return await getBlurredPlaceholder({ image });
  }
};

// src/utils.ts
function renderNamePattern(pattern, replacements) {
  return pattern.replace(/\[(\w+)\]/g, (_substring, type) => {
    if (!Object.prototype.hasOwnProperty.call(replacements, type)) {
      throw new Error(`"[${type}]" is not a valid placeholder in "${pattern}" pattern.`);
    }
    return replacements[type];
  });
}

// src/index.ts
function viteImagePresets(userOptions = {}) {
  const {
    queryParam = "preset",
    outputFileNamePattern = "assets/images/[name]-[width]x[height]-[hash][extname]",
    presets = {}
  } = userOptions;
  const options = {
    queryParam,
    outputFileNamePattern,
    presets: __spreadValues(__spreadValues({}, defaultPresets), presets)
  };
  let viteConfig;
  const registeredImages = new Map();
  return {
    name: "vite-plugin-image-presets",
    enforce: "pre",
    configResolved(resolvedConfig) {
      viteConfig = resolvedConfig;
    },
    async load(id) {
      const { pathname, searchParams } = new URL(id, "file:///");
      if (!searchParams.has(options.queryParam))
        return null;
      const preset = searchParams.get(options.queryParam);
      if (!preset || !(preset in options.presets))
        throw new Error(`Unknown preset "${preset}"`);
      const presetFn = options.presets[preset];
      const path = parse(pathname);
      const image = sharp(pathname);
      const registeredMetadata = [];
      const registerImage = async (image2) => {
        const { info } = await image2.clone().toBuffer({ resolveWithObject: true });
        const hash = createHash("sha256").update(id).update(JSON.stringify(info)).digest("hex").substr(0, 8);
        const fileName = renderNamePattern(options.outputFileNamePattern, {
          preset,
          hash,
          name: path.name,
          extname: `.${info.format}`,
          format: info.format,
          width: info.width.toString(),
          height: info.height.toString()
        });
        const imageMetadata = {
          src: viteConfig.isProduction ? join(viteConfig.base, fileName) : join("/@vite-plugin-image-presets", fileName),
          type: `image/${info.format}`,
          format: info.format,
          size: info.size,
          width: info.width,
          height: info.height
        };
        registeredImages.set(fileName, {
          image: image2.clone(),
          metadata: imageMetadata
        });
        registeredMetadata.push(imageMetadata);
        if (viteConfig.isProduction)
          this.emitFile({
            fileName,
            source: await image2.clone().toBuffer(),
            type: "asset"
          });
        return imageMetadata;
      };
      const data = await presetFn({
        image,
        registeredMetadata,
        registerImage
      });
      const esModuleSource = dataToEsm(data, {
        preferConst: true,
        namedExports: true,
        compact: true
      });
      return esModuleSource;
    },
    configureServer(server) {
      server.middlewares.use("/@vite-plugin-image-presets/", async (req, res) => {
        var _a;
        const key = (_a = req.url) == null ? void 0 : _a.substr(1);
        const result = key ? registeredImages.get(key) : null;
        if (!result) {
          console.log(chalk.red(`Could not find ${key}. This is likely an internal error.`));
          return;
        }
        res.setHeader("Content-Type", `image/${result.metadata.format}`);
        res.setHeader("Cache-Control", "max-age=360000");
        return result.image.clone().pipe(res);
      });
    }
  };
}
export {
  generateWidths,
  getBlurredPlaceholder,
  getTracedSVGPlaceholder,
  metadataToSources,
  optimizeSVG,
  traceSVG,
  viteImagePresets
};
