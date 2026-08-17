import { defineConfig, lazyPlugins, type PluginOption } from "vite-plus";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: lazyPlugins((): PluginOption[] => [vue(), tailwindcss()]),
  run: {
    tasks: {
      dev: {
        command: "vp dev",
        dependsOn: ["@hajime/ui#build", "@hajime/core#build"],
      },
    },
  },
});
