<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import FightScreen from "../FightScreen.vue";
import { BackButton, Button } from "@hajime/ui";
import PreCompetitionScreen from "../pre-competition/PreCompetitionScreen.vue";
import { ref } from "vue";

const route = useRoute();
const router = useRouter();

const competitionId = route.params.id as string;
const isSetup = ref(false);
</script>

<template>
  <main class="container mx-auto p-6">
    <div class="mb-4">
      <BackButton @click="router.push({ name: 'home' })" />
    </div>
    <h1 class="text-2xl font-bold mb-6">Competition {{ competitionId }}</h1>

    <!--    TEMPORARY ----------------------------------------------------------->
    <Button @click="isSetup = !isSetup">isSetup: {{ isSetup }}</Button>
    <!--------------------------------------------------------------------------->

    <div v-if="isSetup">
      <FightScreen :competitionId="competitionId" />
    </div>

    <div v-else>
      <PreCompetitionScreen :competitionId="competitionId" @start="isSetup = true" />
    </div>
  </main>
</template>
