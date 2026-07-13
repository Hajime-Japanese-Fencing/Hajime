<script setup lang="ts">
import { ref } from "vue";
import { FightList } from "@hajime/ui";
import type { AssignIpponEvent, Fight } from "@hajime/ui";
import { FightStatus, IpponCode, Side } from "@hajime/core";

/*
 * @TODO ne plus bloquer les boutons pour ouvrir l'interface de combat lorsque l'on ouvre un combat Finished
 *   C'est le activeFightId qui 'active' un combat lorsque l'on ouvre l'interface d'un combat, qu'il soit fini ou non
 * @TODO décider de la source de verité pour la liste des ippons d'un combat, et harmoniser la logique en fonction
 *   (ipponsGiven est un bon candidat mais en l'etat on ne peut pas savoir quel Ippon est le firstBlood dans un combat donné)
 */

const fights = ref<Fight[]>([
  {
    id: 1,
    fighter1: {
      fighterId: 3,
      fighterName: "Tanaka",
      ipponsGiven: [],
      numberOfHansoku: 0,
    },
    fighter2: {
      fighterId: 9,
      fighterName: "Suzuki",
      ipponsGiven: [],
      numberOfHansoku: 0,
    },
    status: FightStatus.Waiting,
    score: null,
    scoreEvents: [],
    editable: true,
  },
  {
    id: 2,
    fighter1: {
      fighterId: 3,
      fighterName: "Yamamoto",
      ipponsGiven: [IpponCode.Men, IpponCode.Kote, IpponCode.Tsuki],
      numberOfHansoku: 0,
    },
    fighter2: {
      fighterId: 9,
      fighterName: "Sato",
      ipponsGiven: [IpponCode.Do],
      numberOfHansoku: 0,
    },
    status: FightStatus.Finished,
    score: "2 - 1",
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
    fighter1: {
      fighterId: 3,
      fighterName: "Ito",
      ipponsGiven: [],
      numberOfHansoku: 0,
    },
    fighter2: {
      fighterId: 9,
      fighterName: "Kobayashi",
      ipponsGiven: [],
      numberOfHansoku: 0,
    },
    status: FightStatus.Waiting,
    score: null,
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

// A refactor
function onAssignIppon(fightId: number, event: AssignIpponEvent) {
  const fight = getFight(fightId);
  if (!fight) return;

  fight.scoreEvents.push({
    id: nextScoreEventId.value++,
    firstBlood: false,
    leftSide: true, // en attente de refactoring
    type: "ippon",
    code: event.code,
  });
}

function onRemoveIppon(fightId: number, ipponId: number) {
  const fight = getFight(fightId);
  if (!fight) return;
}

function onAssignHansoku(fightId: number, side: Side) {
  const fight = getFight(fightId);
  if (!fight) return;

  // Ajouter un moyen de designer a quel combattant attribuer le Hansoku en paramètre de la methode
  // par side?, fighter1 / fighter2, autre ?
}

function onRemoveHansoku(fightId: number, side: Side) {
  const fight = getFight(fightId);
  if (!fight) return;
}

function getFightScore(fight: Fight): string | null {
  const left = fight.fighter1.ipponsGiven.length;
  const right = fight.fighter2.ipponsGiven.length;

  if (left === 0 && right === 0) {
    return null;
  }

  return `${left} - ${right}`;
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
    @remove-ippon="onRemoveIppon"
    @assign-hansoku="onAssignHansoku"
    @remove-hansoku="onRemoveHansoku"
  />
</template>

<style scoped></style>
