<script setup lang="ts">
import { ref } from "vue";
import { FightList } from "@hajime/ui";
import type { AssignIpponEvent, Fight } from "@hajime/ui";
import { FightStatus } from "@hajime/core";

const fights = ref<Fight[]>([
  {
    id: 1,
    fighter1: "Tanaka",
    fighter2: "Suzuki",
    score: null,
    status: FightStatus.Waiting,
    scoreEvents: [],
    editable: true,
  },
  {
    id: 2,
    fighter1: "Yamamoto",
    fighter2: "Sato",
    score: "2 - 1",
    status: FightStatus.Finished,
    scoreEvents: [
      { id: 1, leftSide: true, type: "ippon", code: "M", firstBlood: true },
      { id: 2, leftSide: false, type: "hansoku", code: "Δ", firstBlood: false },
      { id: 3, leftSide: false, type: "ippon", code: "D", firstBlood: false },
      { id: 4, leftSide: true, type: "ippon", code: "K", firstBlood: false },
    ],
    editable: false,
  },
  {
    id: 3,
    fighter1: "Ito",
    fighter2: "Kobayashi",
    score: null,
    status: FightStatus.Waiting,
    scoreEvents: [],
    editable: true,
  },
]);

const activeFightId = ref<number | null>(null);

const nextScoreEventId = ref(
  Math.max(0, ...fights.value.flatMap((f) => f.scoreEvents.map((e) => e.id))) + 1,
);

function getFight(id: number) {
  return fights.value.find((f) => f.id === id);
}

function onOpenFight(id: number) {
  const fight = getFight(id);

  if (!fight) {
    return;
  }

  activeFightId.value = id;

  if (fight.status === FightStatus.Waiting) {
    updateFightStatus(id, FightStatus.InProgress);
  }
}

function onCloseFight() {
  activeFightId.value = null;
}

function onCancelFight(id: number) {
  activeFightId.value = null;
  updateFightStatus(id, FightStatus.Waiting);
}

function onValidateFight(id: number) {
  activeFightId.value = null;
  updateFightStatus(id, FightStatus.Finished);
}

function onForfeitFight(id: number) {
  activeFightId.value = null;
  updateFightStatus(id, FightStatus.Finished);
}

function updateFightStatus(id: number, status: FightStatus) {
  const fight = getFight(id);

  if (!fight) {
    return;
  }

  // TODO: remplacer par appel API
  fight.status = status;
}

function onAssignIppon(id: number, event: AssignIpponEvent) {
  const fight = getFight(id);
  if (!fight) return;

  fight.scoreEvents.push({
    id: nextScoreEventId.value++,
    firstBlood: false,
    leftSide: true, // en attente de refactoring
    type: "ippon",
    code: event.code,
  });
}
</script>

<template>
  <FightList
    :fights="fights"
    :activeFightId="activeFightId"
    @open-fight="onOpenFight"
    @close-fight="onCloseFight"
    @cancel-fight="onCancelFight"
    @validate-fight="onValidateFight"
    @forfeit-fight="onForfeitFight"
    @assign-ippon="onAssignIppon"
  />
</template>

<style scoped></style>
