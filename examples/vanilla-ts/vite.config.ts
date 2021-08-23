import { defineConfig } from "vite";
import { viteImagePresets } from "vite-plugin-image-presets";

export default defineConfig({
  plugins: [viteImagePresets()],
});
