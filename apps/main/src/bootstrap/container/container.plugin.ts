import type { App, InjectionKey } from "vue";
import type { AppContainer } from "./container.factory.ts";

export const CONTAINER_KEY: InjectionKey<AppContainer> = Symbol("AppContainer");

export function createContainerPlugin(container: AppContainer) {
  return {
    install(app: App) {
      app.provide(CONTAINER_KEY, container);
    },
  };
}
