import { parse, join } from "path";
import chalk from "chalk";
import sharp, { Sharp, FormatEnum } from "sharp";
import { Plugin, ResolvedConfig, ViteDevServer } from "vite";
import { dataToEsm } from "@rollup/pluginutils";
import { createHash } from "crypto";

import type { PluginConfig, ImageMetadata, RegisterImageFn } from "./types";
import { defaultPresets } from "./presets";
import { renderNamePattern } from "./utils";

export function viteImagePresets(userOptions: Partial<PluginConfig> = {}): Plugin {
  const {
    queryParam = "preset",
    outputFileNamePattern = "assets/images/[name]-[width]x[height]-[hash][extname]",
    presets = {},
  } = userOptions;

  const options: PluginConfig = {
    queryParam,
    outputFileNamePattern,
    presets: { ...defaultPresets, ...presets },
  };

  let viteConfig: ResolvedConfig;

  type RegisteredImage = { image: Sharp; metadata: ImageMetadata };
  const registeredImages = new Map<string, RegisteredImage>();

  return {
    name: "vite-plugin-image-presets",
    enforce: "pre",
    configResolved(resolvedConfig: ResolvedConfig) {
      viteConfig = resolvedConfig;
    },
    async load(id: string) {
      const { pathname, searchParams } = new URL(id, "file:///");
      if (!searchParams.has(options.queryParam)) return null;

      const preset = searchParams.get(options.queryParam);
      if (!preset || !(preset in options.presets)) throw new Error(`Unknown preset "${preset}"`);

      const presetFn = options.presets[preset];

      const path = parse(pathname);
      const image = sharp(pathname);

      const registeredMetadata: ImageMetadata[] = [];
      const registerImage: RegisterImageFn = async (image: Sharp) => {
        const { info } = await image.clone().toBuffer({ resolveWithObject: true });

        const hash = createHash("sha256")
          .update(id)
          .update(JSON.stringify(info))
          .digest("hex")
          .substr(0, 8);

        const fileName = renderNamePattern(options.outputFileNamePattern, {
          preset: preset,
          hash,
          name: path.name,
          extname: `.${info.format}`,
          format: info.format,
          width: info.width.toString(),
          height: info.height.toString(),
        });

        const imageMetadata: ImageMetadata = {
          src: viteConfig.isProduction
            ? join(viteConfig.base, fileName)
            : join("/@vite-plugin-image-presets", fileName),
          type: `image/${info.format}`,
          format: info.format as keyof FormatEnum,
          size: info.size,
          width: info.width,
          height: info.height,
        };

        registeredImages.set(fileName, {
          image: image.clone(),
          metadata: imageMetadata,
        });

        registeredMetadata.push(imageMetadata);

        if (viteConfig.isProduction)
          this.emitFile({
            fileName: fileName,
            source: await image.clone().toBuffer(),
            type: "asset",
          });

        return imageMetadata;
      };

      const data = await presetFn({
        image,
        registeredMetadata,
        registerImage,
      });

      const esModuleSource = dataToEsm(data, {
        preferConst: true,
        namedExports: true,
        compact: true,
      });

      return esModuleSource;
    },
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/@vite-plugin-image-presets/", async (req, res) => {
        const key = req.url?.substr(1); // remove leading '/'
        const result = key ? registeredImages.get(key) : null;
        if (!result) {
          console.log(chalk.red(`Could not find ${key}. This is likely an internal error.`));
          return;
        }

        res.setHeader("Content-Type", `image/${result.metadata.format}`);
        res.setHeader("Cache-Control", "max-age=360000");
        return result.image.clone().pipe(res);
      });
    },
  };
}

export * from "./types";
export * from "./workers";
