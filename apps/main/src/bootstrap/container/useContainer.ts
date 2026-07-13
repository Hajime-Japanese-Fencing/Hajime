import { inject } from "vue";
import { CONTAINER_KEY } from "./container.plugin.ts";

export function useContainer() {
  const container = inject(CONTAINER_KEY);
  if (!container) {
    throw new Error("AppContainer not provided. Did you install createContainerPlugin()?");
  }
  return container;
}
