<script setup lang="ts">
import { computed, onMounted } from "vue";
import { FightList } from "@hajime/ui";
import type { AssignIpponEvent, Fight } from "@hajime/ui";
import { makeCompetitionId, type FightId, type ScoreEventId, type Side } from "@hajime/core";
import { useContainer } from "./bootstrap/container/useContainer.ts";
import { useActiveCompetition } from "./active-competition/composables/use-active-competition.ts";
import { presentFight } from "./active-competition/presenters/fight-record-to-fight.presenter.ts";

const container = useContainer();
const activeCompetition = useActiveCompetition(container.activeCompetition);

onMounted(async () => {
  await container.loadCompetition(makeCompetitionId("demo"));
});

const fights = computed<Fight[]>(() => activeCompetition.view.value.fights.map(presentFight));
const activeFightId = computed(() => activeCompetition.view.value.activeFight?.id ?? null);

function onOpenFight(id: FightId) {
  void activeCompetition.openFight(id);
}

function onCloseFight() {
  activeCompetition.closeFight();
}

function onCancelFight(_id: FightId) {
  void activeCompetition.cancelActiveFight();
}

function onValidateFight(_id: FightId) {
  void activeCompetition.validateActiveFight();
}

function onForfeitFight(_id: FightId) {
  void activeCompetition.forfeitActiveFight();
}

function onAssignIppon(_fightId: FightId, event: AssignIpponEvent) {
  if (event.code === "Δ") return;

  void activeCompetition.recordIppon({ side: event.side, code: event.code });
}

function onRemoveIppon(_fightId: FightId, scoreEventId: ScoreEventId) {
  void activeCompetition.removeScoreEvent({ scoreEventId, type: "ippon" });
}

function onAssignHansoku(_fightId: FightId, side: Side) {
  void activeCompetition.recordHansoku({ side });
}

function onRemoveHansoku(_fightId: FightId, scoreEventId: ScoreEventId) {
  void activeCompetition.removeScoreEvent({ scoreEventId, type: "hansoku" });
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
