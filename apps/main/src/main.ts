import { createApp } from "vue";
import { VueQueryPlugin } from "@tanstack/vue-query";
import App from "./App.vue";
import { router } from "./router.ts";
import { bootstrapContainer } from "./bootstrap/container/container.factory.ts";
import { createContainerPlugin } from "./bootstrap/container/container.plugin.ts";

import "@hajime/ui/theme.css";

const container = bootstrapContainer(import.meta.env);

createApp(App).use(router).use(VueQueryPlugin).use(createContainerPlugin(container)).mount("#app");
