<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Button, FightList, SelectorList } from "@hajime/ui";
import type { AssignIpponEvent, Fight } from "@hajime/ui";
import {
  buildBracketExport,
  buildPoolExport,
  makeCompetitionId,
  type FightId,
  type FighterEntry,
  type ScoreEventId,
  type Side,
} from "@hajime/core";
import { useContainer } from "./bootstrap/container/useContainer.ts";
import { useActiveCompetition } from "./features/active-competition/composables/use-active-competition.ts";
import { useFightGroupSelector } from "./features/active-competition/composables/use-fight-group-selector.ts";
import {
  presentFight,
  presentPendingMatch,
} from "./features/active-competition/presenters/fight-record-to-fight.presenter.ts";
import { exportBracketToPdf } from "./features/active-competition/adapters/export-bracket-to-pdf.ts";
import { exportPoolToPdf } from "./features/active-competition/adapters/export-pool-to-pdf.ts";

const props = defineProps<{
  competitionId: string;
}>();

const container = useContainer();
const activeCompetition = useActiveCompetition(container.activeCompetition);
const {
  phaseItems,
  selectedPhase,
  groupItems,
  selectedGroupId,
  groupFights,
  groupPendingMatches,
  isSelectedGroupUnlocked,
} = useFightGroupSelector(activeCompetition.view);

watch(
  () => props.competitionId,
  async (competitionId) => {
    await container.loadCompetition(makeCompetitionId(competitionId));
  },
  { immediate: true },
);

// --- TEMPORARY: NO FIGHTER REGISTRATION SCREEN YET, SO THIS IS A GENERATED ROSTER JUST TO
// EXERCISE THE REAL generateBracketUseCase -> buildBracketDraw PIPELINE END TO END. TO REPLACE
// ONCE FIGHTER REGISTRATION EXISTS. ---
function makeDemoFighters(count: number): FighterEntry[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `fighter-${index + 1}`,
    isSeeded: false,
    club: "Demo Dojo",
  }));
}

// --- DEFAULTS TO 8 (A POWER OF TWO, NO BYES) SO THE FIRST-EVER CLICK PRODUCES A "CLEAN" DRAW —
// PICK AN ODD COUNT (E.G. 5) TO EXERCISE BYE HANDLING INSTEAD. generateBracket REJECTS FEWER
// THAN 2 FIGHTERS, SO THE BUTTON STAYS DISABLED BELOW THAT. ---
const fighterCount = ref(8);
const isFighterCountValid = computed(
  () => Number.isInteger(fighterCount.value) && fighterCount.value >= 2,
);

const isGeneratingBracket = ref(false);

async function onGenerateBracketDraft() {
  if (!isFighterCountValid.value) return;

  isGeneratingBracket.value = true;
  try {
    await container.generateBracketDraw(
      makeCompetitionId(props.competitionId),
      makeDemoFighters(fighterCount.value),
    );
  } finally {
    isGeneratingBracket.value = false;
  }
}

// --- BRACKET ROWS ARE ORDERED BY THEIR POSITION IN THE ROUND (bracketMatchIndex / matchIndex),
// SAME AS THE PDF EXPORT — NOT "EVERY PLAYABLE FIGHT FIRST, THEN EVERY STILL-PENDING MATCH".
// A BYE (OR ANY EARLY RESULT) CAN MAKE A LATER-POSITION MATCH PLAYABLE BEFORE AN EARLIER ONE
// (E.G. BOTH SEMI-FINAL SLOT-2 FIGHTERS ALREADY KNOWN VIA BYES WHILE SLOT-1 STILL WAITS ON A
// QUARTER-FINAL RESULT), SO SORTING PLAYABLE-FIRST WOULD SHOW IT ABOVE SLOT-1 EVEN THOUGH IT
// SITS BELOW IT IN THE BRACKET. POOL FIGHTS HAVE NO bracketMatchIndex (ALWAYS null), SO THIS
// SORT IS A NO-OP FOR THEM AND THEY KEEP THEIR ORIGINAL (CREATION) ORDER. ---
const fights = computed<Fight[]>(() => {
  const fightRows = groupFights.value.map((record) => ({
    matchIndex: record.bracketMatchIndex,
    fight: presentFight(record, isSelectedGroupUnlocked.value),
  }));
  const pendingRows = groupPendingMatches.value.map(({ bracketRoundId, match }) => ({
    matchIndex: match.matchIndex as number | null,
    fight: presentPendingMatch(bracketRoundId, match),
  }));

  return [...fightRows, ...pendingRows]
    .sort((a, b) => (a.matchIndex ?? 0) - (b.matchIndex ?? 0))
    .map((row) => row.fight);
});
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

function onExport() {
  if (selectedPhase.value === "pool") {
    const poolExport = buildPoolExport(activeCompetition.view.value);
    exportPoolToPdf(poolExport, "pools.pdf");
    return;
  }

  const bracketExport = buildBracketExport(activeCompetition.view.value);
  exportBracketToPdf(bracketExport, "bracket.pdf");
}
</script>

<template>
  <div class="mb-4 flex items-center gap-2">
    <Button @click="onExport">Export to PDF</Button>
    <Button :disabled="isGeneratingBracket || !isFighterCountValid" @click="onGenerateBracketDraft">
      Générer un tableau (démo)
    </Button>
    <label class="flex items-center gap-1 text-sm">
      Combattants
      <input
        v-model.number="fighterCount"
        type="number"
        min="2"
        step="1"
        class="w-16 rounded border px-2 py-1"
      />
    </label>
  </div>
  <div class="flex gap-4">
    <SelectorList
      v-if="phaseItems.length > 1"
      v-model="selectedPhase"
      :items="phaseItems"
      class="w-40 shrink-0"
    />

    <SelectorList
      v-if="groupItems.length > 1"
      v-model="selectedGroupId"
      :items="groupItems"
      class="w-56 shrink-0"
    />

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
  </div>
</template>

<style scoped></style>
