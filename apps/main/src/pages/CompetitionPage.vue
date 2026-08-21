<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { BackButton, Button } from "@hajime/ui";
import PreCompetitionScreen from "../pre-competition/PreCompetitionScreen.vue";
import { computed, ref } from "vue";
import PoolScreen from "../PoolScreen.vue";
import { type SelectorItem, SelectorList } from "@hajime/ui";

const route = useRoute();
const router = useRouter();

const competitionId = route.params.id as string;
const isSetup = ref(false);
const selectors = computed<SelectorItem[]>(() => [
  { id: "pools", label: "Pools" },
  { id: "bracket", label: "Bracket" },
]);
const selectedView = ref<string>("pools");

function onStart() {
  isSetup.value = true;
}
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

    <section v-if="isSetup">
      <SelectorList
        :items="selectors"
        v-model="selectedView"
        direction="row"
        size="sm"
        class="mb-2"
      />

      <section v-if="selectedView == 'pools'">
        <PoolScreen :competitionId="competitionId"></PoolScreen>
      </section>

      <section v-if="selectedView == 'bracket'">BRACKET</section>
    </section>

    <section v-else>
      <PreCompetitionScreen :competitionId="competitionId" @start="onStart" />
    </section>
  </main>
</template>
