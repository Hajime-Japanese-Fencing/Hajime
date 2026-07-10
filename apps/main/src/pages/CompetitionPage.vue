<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import FightScreen from "../FightScreen.vue";

const route = useRoute();
const router = useRouter();

const competitionId = route.params.id as string;
</script>

<template>
  <main class="container mx-auto p-6">
    <div class="mb-4">
      <button class="btn btn-ghost btn-sm" @click="router.push({ name: 'home' })">← Back</button>
    </div>
    <h1 class="text-2xl font-bold mb-6">Competition {{ competitionId }}</h1>
    <FightScreen />
  </main>
</template>
