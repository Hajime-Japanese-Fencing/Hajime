<script setup lang="ts">

import { ref } from "vue";
import FightList from "./FightList.vue";
import type {Fight, FightStatus, NewResultEvent} from "./fight.interface.ts";


const fights = ref<Fight[]>([
  {
    id: 1,
    fighter1: "Tanaka",
    fighter2: "Suzuki",
    score: null,
    status: "Waiting",
    scoreEvents: [],
    editable: true,
  },
  {
    id: 2,
    fighter1: "Yamamoto",
    fighter2: "Sato",
    score: "2 - 1",
    status: "Finished",
    scoreEvents: [
      { id: 1, leftFighter: true, type: "ippon", code: "M", variant: "outline" },
      { id: 2, leftFighter: false, type: "hansoku", code: "Δ", variant: "filled" },
      { id: 3, leftFighter: false, type: "ippon", code: "D", variant: "filled" },
      { id: 4, leftFighter: true, type: "ippon", code: "K", variant: "filled" },
    ],
    editable: false,
  },
  {
    id: 3,
    fighter1: "Ito",
    fighter2: "Kobayashi",
    score: null,
    status: "Waiting",
    scoreEvents: [],
    editable: true,
  },
]);

const openedFightId = ref<number | null>(null);

const nextScoreEventId = ref(
    Math.max(
        0,
        ...fights.value.flatMap(f =>
            f.scoreEvents.map(e => e.id)
        )
    ) + 1
);

function getFight(id: number) {
  return fights.value.find(f => f.id === id);
}

function onOpenFight(id: number) {
  const fight = getFight(id);

  if (!fight) {
    return;
  }

  openedFightId.value = id;

  if (fight.status === "Waiting") {
    updateFightStatus(id, "In progress");
  }
}

function onCloseFight() {
  openedFightId.value = null;
}

function onCancelFight(id: number) {
  openedFightId.value = null;
  updateFightStatus(id, "Waiting");
}

function onValidateFight(id: number) {
  openedFightId.value = null;
  updateFightStatus(id, "Finished");
}

function onForfeitFight(id: number) {
  openedFightId.value = null;
  updateFightStatus(id, "Finished");
}

function updateFightStatus(id: number, status: FightStatus) {
  const fight = getFight(id);

  if (!fight) {
    return;
  }

  // TODO: remplacer par appel API
  fight.status = status;
}

function addScoreEvent(id: number, event: NewResultEvent) {
  const fight = getFight(id);
  if (!fight) return;

  fight.scoreEvents.push({
    id: nextScoreEventId.value++,
    ...event,
  });
}


</script>

<template>
  <FightList
      :fights="fights"
      :opened-fight-id="openedFightId"
      @open-fight="onOpenFight"
      @close-fight="onCloseFight"
      @cancel-fight="onCancelFight"
      @validate-fight="onValidateFight"
      @forfeit-fight="onForfeitFight"
      @add-score-event="addScoreEvent"
  />
</template>

<style scoped>

</style>