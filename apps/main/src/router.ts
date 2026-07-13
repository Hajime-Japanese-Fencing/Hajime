import { createRouter, createWebHistory } from "vue-router";
import HomePage from "./pages/HomePage.vue";
import CompetitionPage from "./pages/CompetitionPage.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomePage,
  },
  {
    path: "/competition/:id",
    name: "competition",
    component: CompetitionPage,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
