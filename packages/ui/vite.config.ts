import { defineConfig, lazyPlugins, type PluginOption } from "vite-plus";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import UnpluginVue from "unplugin-vue/rolldown";

export default defineConfig({
  plugins: lazyPlugins((): PluginOption[] => [vue(), tailwindcss()]),
  pack: {
    clean: false,
    plugins: [UnpluginVue({ isProduction: true })],
    dts: { vue: true },
  },
});
