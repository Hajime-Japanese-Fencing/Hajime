<script setup lang="ts">
import { Button } from "@hajime/ui";
import RankingDetails from "@hajime/ui/src/components/ranking-details.vue";
import {ref} from "vue";

const fighters = ref(
    [
      {
        number: 1,
        fighterName: "john",
        points: 2,
        nbVictories: 3,
        nbGivenIppons: 4,
        nbReceivedIppons: 2
      },
      {
        number: 2,
        fighterName: "dave",
        points: -1,
        nbVictories: 1,
        nbGivenIppons: 2,
        nbReceivedIppons: 4
      },
      {
        number: 2,
        fighterName: "dave",
        points: -1,
        nbVictories: 1,
        nbGivenIppons: 2,
        nbReceivedIppons: 4
      },
    ])

</script>

<template>
  <main class="min-h-screen bg-base-200 p-10 flex flex-col gap-8">
    <h1 class="text-3xl font-bold">UI Showcase — Button</h1>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Variants</h2>
      <div class="flex flex-wrap gap-3">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="accent">Accent</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="outline">Outline</Button>
      </div>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Sizes</h2>
      <div class="flex flex-wrap items-end gap-3">
        <Button size="xs">Extra Small</Button>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Disabled</h2>
      <div class="flex flex-wrap gap-3">
        <Button disabled>Disabled</Button>
        <Button variant="secondary" disabled>Disabled Secondary</Button>
      </div>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Mon composant</h2>
      <ranking-details v-model="fighters"></ranking-details>
    </section>
  </main>
</template>
