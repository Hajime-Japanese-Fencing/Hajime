import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  lint: {
    // --- packages/ui/vite.config.ts triggers a false-positive "excessive stack depth" (TS2321)
    // in tsgo (@typescript/native-preview, used here for typeAware checking) on the combination
    // of `plugins` + `pack.plugins` (unplugin-vue/rolldown). Confirmed a false positive: the
    // file passes cleanly under the standard compiler (`vue-tsc --noEmit`). Excluded until tsgo
    // fixes this — remove once it does. ---
    ignorePatterns: ["**/*.stories.ts", "**/.storybook/**", "packages/ui/vite.config.ts"],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  run: {
    cache: true,
  },
});
