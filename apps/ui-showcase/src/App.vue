<script setup lang="ts">
import { Button, Modal, FightRow } from "@hajime/ui";
import {ref} from "vue";
import type {FighterPoints, ModalContent} from "@hajime/ui";

const fighters = ref<FighterPoints>(
    [
      {
        fighterName: "john",
        points: 2,
        nbVictories: 3,
        nbGivenIppons: 4,
        nbReceivedIppons: 2
      },
      {
        fighterName: "dave",
        points: -1,
        nbVictories: 1,
        nbGivenIppons: 2,
        nbReceivedIppons: 4
      },
      {
        fighterName: "dave",
        points: -1,
        nbVictories: 1,
        nbGivenIppons: 2,
        nbReceivedIppons: 4
      },
    ])
const rankingDetailsContent = ref<ModalContent>(
    {
      name: "Ranking Details",
      content: fighters
    }
)


const fights = ref([
  {
    id: 1,
    fighter1: "Tanaka",
    fighter2: "Suzuki",
    score: null,
    status: "Waiting",
  },
  {
    id: 2,
    fighter1: "Yamamoto",
    fighter2: "Sato",
    score: "2 - 1",
    status: "Finished",
  },
  {
    id: 3,
    fighter1: "Ito",
    fighter2: "Kobayashi",
    score: null,
    status: "Waiting",
  },
]);

const activeFightId = ref<number | null>(null);

function onToggleFight(id: number) {
  if (activeFightId.value === id) {
    activeFightId.value = null;
  } else {
    const fight = fights.value.find(f => f.id === id);

    if (!fight) {
      return;
    }

    activeFightId.value = id;
  }
}

function onCancelFight(id: number) {
  const fight = fights.value.find(f => f.id === id);

  if (!fight) {
    return;
  }

  setFightStatus(id, "Waiting");
  activeFightId.value = null;
}

function onValidateFight(id: number) {
  const fight = fights.value.find(f => f.id === id);

  if (!fight) {
    return;
  }

  setFightStatus(id, "Finished");
  activeFightId.value = null;
}

function onForfeitFight() {}

type FightStatus = "Waiting" | "In progress" | "Finished";

function setFightStatus(id: number, status: FightStatus) {
  const fight = fights.value.find(f => f.id === id);

  if (!fight || fight.status === "Finished") return;

  // TODO: remplacer par l'appel API lorsque le backend sera prêt
  fight.status = status;
}

</script>

<template>
  <main class="min-h-screen bg-base-200 p-10 flex flex-col gap-8">
    <h1 class="text-3xl font-bold">UI Showcase — Button</h1>

    <section>
      <h2 class="text-xl font-semibold">Fight list</h2>
      <div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
        <table class="table border-solid border-2">
          <thead>
          <tr>
            <th class="text-right">Red</th>
            <th class="text-center w-40">↔</th>
            <th class="text-left">White</th>
            <th class="">Status</th>
            <th class=""></th>
          </tr>
          </thead>
          <tbody>
          <FightRow
              :fight="fight"
              :active="activeFightId === fight.id"
              @toggleFight="onToggleFight"
              @cancelFight="onCancelFight"
              @validateFight="onValidateFight"
              @forfeitFight="onForfeitFight"
              v-for="fight in fights" :key="fight.id"
          />
          </tbody>
        </table>
      </div>
    </section>

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
      <Modal v-model="rankingDetailsContent"></Modal>
    </section>
  </main>
</template>
