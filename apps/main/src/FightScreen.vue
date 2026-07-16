<script setup lang="ts">
import { computed, onMounted } from "vue";
import { FightList } from "@hajime/ui";
import type { AssignIpponEvent, Fight } from "@hajime/ui";
import { FightStatus, Side, makeCompetitionId, type FightId } from "@hajime/core";
import type { FightRecord, ScoreEventId } from "@hajime/core";
import { useContainer } from "./bootstrap/container/useContainer.ts";
import { useActiveCompetition } from "./active-competition/composables/use-active-competition.ts";
import { DemoLoadCompetitionFightsAdapter } from "./active-competition/adapters/demo-load-competition-fights.adapter.ts";

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
  const scoreEvents = record.scoreEvents;

  const ipponsRed = record.scoreEvents
    .filter((e) => e.type === "ippon" && e.fighterId === record.redFighterId)
    .map((e) => e.code as any);

  const ipponsWhite = record.scoreEvents
    .filter((e) => e.type === "ippon" && e.fighterId === record.whiteFighterId)
    .map((e) => e.code as any);

  const score =
    ipponsRed.length === 0 && ipponsWhite.length === 0
      ? null
      : `${ipponsRed.length} - ${ipponsWhite.length}`;

  return {
    id: record.id,
    fighter1: {
      fighterId: record.redFighterId,
      fighterName: String(record.redFighterId),
    },
    fighter2: {
      fighterId: record.whiteFighterId,
      fighterName: String(record.whiteFighterId),
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

function getFightRecord(fightId: FightId): FightRecord | undefined {
  return container.activeCompetition.fights.state[fightId as FightId];
}

// ---------------------------------------------------------------------------
// Event handlers — délèguent au store
// ---------------------------------------------------------------------------

function onOpenFight(id: FightId) {
  activeCompetition.openFight(id as FightId);
}

function onCloseFight() {
  activeCompetition.closeFight();
}

function onCancelFight(id: FightId) {
  activeCompetition.cancelFight(id as FightId);
}

function onValidateFight(id: FightId) {
  activeCompetition.validateFight(id as FightId);
}

function onForfeitFight(id: FightId) {
  activeCompetition.forfeitFight(id as FightId);
}

function onAssignIppon(fightId: FightId, event: AssignIpponEvent) {
  const fight = getFightRecord(fightId);
  if (!fight) return;

  const fighterId = event.side === Side.Red ? fight.redFighterId : fight.whiteFighterId;
  activeCompetition.assignIppon(fightId as FightId, fighterId, event.code as any);
}

function onRemoveIppon(fightId: FightId, ipponId: ScoreEventId) {
  activeCompetition.removeIppon(fightId as FightId, ipponId);
}

function onAssignHansoku(fightId: FightId, side: Side) {
  const fight = getFightRecord(fightId);
  if (!fight) return;

  const fighterId = side === Side.Red ? fight.redFighterId : fight.whiteFighterId;
  activeCompetition.assignHansoku(fightId as FightId, fighterId);
}

function onRemoveHansoku(fightId: FightId, hansokuId: ScoreEventId) {
  const fight = getFightRecord(fightId);
  if (!fight) return;

  activeCompetition.removeHansoku(fightId as FightId, hansokuId);
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
