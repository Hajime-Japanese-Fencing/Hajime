import { defineConfig } from "vite-plus";
import vue from "@vitejs/plugin-vue";
import { lazyPlugins } from "vite-plus";
import tailwindcss from "@tailwindcss/vite";
import UnpluginVue from "unplugin-vue/rolldown";

export default defineConfig({
  plugins: lazyPlugins(() => [vue(), tailwindcss()]),
  pack: {
    plugins: [UnpluginVue({ isProduction: true })],
    dts: { vue: true },
  },
});
