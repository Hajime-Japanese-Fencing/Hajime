<script setup lang="ts">
import { computed, onMounted } from "vue";
import { FightList } from "@hajime/ui";
import type { AssignIpponEvent, Fight, IpponResultEvent } from "@hajime/ui";
import { FightStatus, Side, makeCompetitionId, type FightId } from "@hajime/core";
import type { FightRecord } from "@hajime/core";
import { useContainer } from "./bootstrap/container/useContainer.ts";
import { useActiveCompetition } from "./active-competition/composables/use-active-competition.ts";
import { DemoLoadCompetitionFightsAdapter } from "./active-competition/adapters/demo-load-competition-fights.adapter.ts";

/*
 * @TODO ne plus bloquer les boutons pour ouvrir l'interface de combat lorsque l'on ouvre un combat Finished
 *   C'est le activeFightId qui 'active' un combat lorsque l'on ouvre l'interface d'un combat, qu'il soit fini ou non
 * @TODO décider de la source de verité pour la liste des ippons d'un combat, et harmoniser la logique en fonction
 *   (ipponsGiven est un bon candidat mais en l'etat on ne peut pas savoir quel Ippon est le firstBlood dans un combat donné)
 */

const container = useContainer();
const activeCompetition = useActiveCompetition(container.activeCompetition);

/**
 * @todo pas bon, doit venir du container, ici on a une dépendance directe.
 */
const loadAdapter = new DemoLoadCompetitionFightsAdapter();

onMounted(async () => {
  const data = await loadAdapter.load(makeCompetitionId("demo"));
  container.activeCompetition.loadFights(data.pools, data.fights);
});

// ---------------------------------------------------------------------------
// Projection FightRecord (domaine core) → Fight (type UI FightList)
// ---------------------------------------------------------------------------

/**
 * @todo Migrer dans un fichier à côté
 * Fait actuellement la conversion store <-> UI component
 */
function toUiFight(record: FightRecord): Fight {
  const scoreEvents = record.scoreEvents.map((e) => ({
    id: Number(e.id),
    leftSide: e.fighterId === record.redFighterId,
    type: e.type,
    code: e.code as IpponResultEvent["code"],
    firstBlood: e.firstBlood,
  }));

  const ipponsRed = record.scoreEvents
    .filter((e) => e.type === "ippon" && e.fighterId === record.redFighterId)
    .map((e) => e.code as any);

  const ipponsWhite = record.scoreEvents
    .filter((e) => e.type === "ippon" && e.fighterId === record.whiteFighterId)
    .map((e) => e.code as any);

  const hansokuRed = record.scoreEvents.filter(
    (e) => e.type === "hansoku" && e.fighterId === record.redFighterId,
  ).length;

  const hansokuWhite = record.scoreEvents.filter(
    (e) => e.type === "hansoku" && e.fighterId === record.whiteFighterId,
  ).length;

  const score =
    ipponsRed.length === 0 && ipponsWhite.length === 0
      ? null
      : `${ipponsRed.length} - ${ipponsWhite.length}`;

  return {
    id: Number(record.id),
    fighter1: {
      fighterId: Number(record.redFighterId),
      fighterName: String(record.redFighterId),
      ipponsGiven: ipponsRed,
      numberOfHansoku: hansokuRed,
    },
    fighter2: {
      fighterId: Number(record.whiteFighterId),
      fighterName: String(record.whiteFighterId),
      ipponsGiven: ipponsWhite,
      numberOfHansoku: hansokuWhite,
    },
    status: record.status,
    score,
    scoreEvents,
    editable: record.status !== FightStatus.Finished,
  };
}

const fights = computed<Fight[]>(() =>
  activeCompetition.fights.value.map((record) => toUiFight(record)),
);

const activeFightId = activeCompetition.activeFightId;

function getFightRecord(fightId: number): FightRecord | undefined {
  return container.activeCompetition.fights.state[fightId as FightId];
}

// ---------------------------------------------------------------------------
// Event handlers — délèguent au store
// ---------------------------------------------------------------------------

function onOpenFight(id: number) {
  activeCompetition.openFight(id as FightId);
}

function onCloseFight() {
  activeCompetition.closeFight();
}

function onCancelFight(id: number) {
  activeCompetition.cancelFight(id as FightId);
}

function onValidateFight(id: number) {
  activeCompetition.validateFight(id as FightId);
}

function onForfeitFight(id: number) {
  activeCompetition.forfeitFight(id as FightId);
}

function onAssignIppon(fightId: number, event: AssignIpponEvent) {
  const fight = getFightRecord(fightId);
  if (!fight) return;

  const fighterId = event.side === Side.Red ? fight.redFighterId : fight.whiteFighterId;
  activeCompetition.assignIppon(fightId as FightId, fighterId, event.code as any);
}

function onRemoveIppon(fightId: number, ipponId: number) {
  activeCompetition.removeIppon(fightId as FightId, ipponId);
}

function onAssignHansoku(fightId: number, side: Side) {
  const fight = getFightRecord(fightId);
  if (!fight) return;

  const fighterId = side === Side.Red ? fight.redFighterId : fight.whiteFighterId;
  activeCompetition.assignHansoku(fightId as FightId, fighterId);
}

function onRemoveHansoku(fightId: number, side: Side) {
  const fight = getFightRecord(fightId);
  if (!fight) return;

  // @TODO: when removing, we need the specific score event id, not the side
  // For now, remove the last hansoku of that side
  const lastHansoku = [...fight.scoreEvents]
    .reverse()
    .find(
      (e) =>
        e.type === "hansoku" &&
        e.fighterId === (side === Side.Red ? fight.redFighterId : fight.whiteFighterId),
    );

  if (lastHansoku) {
    activeCompetition.removeHansoku(fightId as FightId, lastHansoku.id);
  }
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
