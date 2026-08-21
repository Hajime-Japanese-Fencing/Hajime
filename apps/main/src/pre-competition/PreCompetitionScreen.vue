<script setup lang="ts">
import { type SelectorItem, SelectorList } from "@hajime/ui";
import { Dropdown } from "@hajime/ui";
import type { DropdownOption } from "@hajime/ui";
import { computed, ref } from "vue";
import type { PoolSetup } from "@hajime/core";
import { calculatePossiblePoolSetups } from "@hajime/core";
import {
  distributeFightersInPools,
  type CreateFighterInput,
  type FighterEntry,
} from "@hajime/core";
import { poolToPoolDetails } from "./poolToPoolDetails.mapper.ts";
import type { Pool } from "@hajime/core";
import { RankingDetailBuilder } from "@hajime/ui";
import { poolSetupToDropdownOption } from "./poolSetupToDropdownOption.mapper.ts";
import { Button } from "@hajime/ui";
import { shuffle } from "@hajime/core";
import { PoolCreationCard } from "@hajime/ui";
import type { CompetitionPhase } from "./competition-phase.ts";
import { useContainer } from "../bootstrap/container/useContainer.ts";
import { useActiveCompetition } from "../features/active-competition/composables/use-active-competition.ts";
import { makeCompetitionId } from "@hajime/core";

const testFighterInputs: CreateFighterInput[] = [
  { name: "Fighter1", isSeeded: true, club: "Paris Kendo Club" },
  { name: "Fighter2", isSeeded: false, club: "Paris Kendo Club" },
  { name: "Fighter3", isSeeded: false, club: "Lyon Kendo Club" },
  { name: "Fighter4", isSeeded: true, club: "Lyon Kendo Club" },
  { name: "Fighter5", isSeeded: false, club: "Marseille Kenshikan" },
  { name: "Fighter6", isSeeded: false, club: "Marseille Kenshikan" },
  { name: "Fighter7", isSeeded: true, club: "Bordeaux Kendo" },
  { name: "Fighter8", isSeeded: false, club: "Bordeaux Kendo" },
  { name: "Fighter9", isSeeded: false, club: "Toulouse Kendo Kai" },
];

// -------------------------------------------
// INPUTS
// -------------------------------------------
const props = defineProps<{
  competitionId: string;
}>();
const container = useContainer();
const activeCompetition = useActiveCompetition(container.activeCompetition);
// Fighter data now features a real ID from create-fighter use case
const fighters: FighterEntry[] = testFighterInputs.map((input) => container.createFighter(input));
const competitionFormula: CompetitionPhase[] = ["POOLS", "BRACKET"];

const shouldSeparateClubMembers = false;
const shouldSeparateSeededCompetitors = false;

const selectedSetup = ref<PoolSetup>({ poolGroups: [], fightCount: 0 });
const pools = ref<Pool[]>([]);

const nbFighters = fighters.length;

// BUILDING SELECTORS
const poolsValidated = ref(!competitionFormula.includes("POOLS"));
const bracketValidated = ref(!competitionFormula.includes("BRACKET"));

const selectors = computed<SelectorItem[]>(() => {
  const items: SelectorItem[] = [];
  if (competitionFormula.includes("POOLS")) {
    items.push({ id: "pools", label: "Pools" });
  }
  if (competitionFormula.includes("BRACKET")) {
    items.push({ id: "bracket", label: "Bracket", disabled: !poolsValidated.value });
  }
  return items;
});

const selectedView = ref<string>(selectors.value[0].id);
const title = ref("Select a pool repartition");
const options: DropdownOption[] = calculatePossiblePoolSetups(nbFighters).map(
  (poolSetup: PoolSetup) => poolSetupToDropdownOption(poolSetup),
);

// -------------------------------------------
// FUNCTIONS
// -------------------------------------------
function onDropdownSelect(option: DropdownOption) {
  title.value = option.label;
  selectedSetup.value = option.return();
  pools.value = distributeFightersInPools(
    fighters,
    selectedSetup.value,
    shuffle,
    shouldSeparateClubMembers,
    shouldSeparateSeededCompetitors,
  );
}

async function onPoolValidation() {
  poolsValidated.value = true;
  await container.publishPoolDraw(makeCompetitionId(props.competitionId), pools.value);
}

const emit = defineEmits<{
  start: [];
}>();
</script>

<template>
  <div class="flex gap-4">
    <SelectorList :items="selectors" v-model="selectedView" />

    <section v-if="selectedView === 'pools'" class="flex flex-1 flex-col gap-1 justify-between">
      <div>Pool Repartition</div>
      <Dropdown
        v-if="!poolsValidated"
        :title="title"
        :options="options"
        @select="onDropdownSelect"
      />
      <div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(18rem,1fr))]">
        <PoolCreationCard
          v-for="pool of pools"
          :key="pool.number"
          :pool-details="poolToPoolDetails(pool)"
          :ranking-details="
            pool.fighters.map((f) => new RankingDetailBuilder().withName(f.fighter.name).build())
          "
        />
      </div>
      <div class="flex gap-1 justify-end">
        <Button v-if="!poolsValidated" :disabled="pools.length == 0" @click="onPoolValidation()">
          Validate Pools
        </Button>
        <Button :disabled="!poolsValidated || !bracketValidated" @click="emit('start')">
          Start
        </Button>
      </div>
    </section>

    <section v-if="selectedView === 'bracket'">
      <!--      TODO: DEVELOP BRACKET DEFINITION SCREEN -->
      BRACKET
      <div class="flex gap-1 justify-end">
        <Button v-if="!bracketValidated" @click="bracketValidated = true">
          Validate Bracket
        </Button>
        <Button :disabled="!poolsValidated || !bracketValidated" @click="emit('start')">
          Start
        </Button>
      </div>
    </section>
  </div>
</template>

<style scoped></style>
