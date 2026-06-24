import { defineConfig } from "vite-plus";
import vue from "@vitejs/plugin-vue";
import { lazyPlugins } from "vite-plus";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: lazyPlugins(() => [vue(), tailwindcss()]),
  run: {
    tasks: {
      dev: {
        command: "vp dev",
        dependsOn: ["@hajime/ui#build", "@hajime/core#build"],
      },
    },
  },
});
