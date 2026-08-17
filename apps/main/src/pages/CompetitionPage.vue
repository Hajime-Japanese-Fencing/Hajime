<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import FightScreen from "../FightScreen.vue";
import { BackButton } from "@hajime/ui";
import PreCompetitionScreen from "../PreCompetitionScreen.vue";

const route = useRoute();
const router = useRouter();

const competitionId = route.params.id as string;
</script>

<template>
  <main class="container mx-auto p-6">
    <div class="mb-4">
      <BackButton @click="router.push({ name: 'home' })" />
    </div>
    <h1 class="text-2xl font-bold mb-6">Competition {{ competitionId }}</h1>
    <FightScreen />
    <PreCompetitionScreen />
  </main>
</template>
