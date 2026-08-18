<script setup lang="ts">
import { type SelectorItem, SelectorList } from "@hajime/ui";
import { Dropdown } from "@hajime/ui";
import type { DropdownOption } from "@hajime/ui";
import { computed, ref } from "vue";
import type { PoolSetup } from "@hajime/core";
import { calculatePossiblePoolSetups } from "@hajime/core";
import { distributeFightersInPools, type FighterEntry } from "@hajime/core";
import { poolToPoolDetails } from "./poolToPoolDetails.mapper.ts";
import type { Pool } from "@hajime/core";
import { RankingDetailBuilder } from "@hajime/ui";
import { PoolCard } from "@hajime/ui";
import { poolSetupToDropdownOption } from "./poolSetupToDropdownOption.mapper.ts";
import { Button } from "@hajime/ui";

// -------------------------------------------
// INPUTS
// -------------------------------------------

const selectedSetup = ref<PoolSetup>({ poolGroups: [], fightCount: 0 });
const pools = ref<Pool[]>([]);
const shouldSeparateClubMembers = false;
const shouldSeparateSeededCompetitors = false;

const poolsValidated = ref(false);

const selectors = computed<SelectorItem[]>(() => [
  { id: "pools", label: "Pools" },
  { id: "bracket", label: "Bracket", disabled: !poolsValidated.value },
]);
const selectedView = ref<string>("pools");

const fighters: FighterEntry[] = [
  { id: "1", isSeeded: true, club: "Paris Kendo Club" },
  { id: "2", isSeeded: false, club: "Paris Kendo Club" },
  { id: "3", isSeeded: false, club: "Lyon Kendo Club" },
  { id: "4", isSeeded: true, club: "Lyon Kendo Club" },
  { id: "5", isSeeded: false, club: "Marseille Kenshikan" },
  { id: "6", isSeeded: false, club: "Marseille Kenshikan" },
  { id: "7", isSeeded: true, club: "Bordeaux Kendo" },
  { id: "8", isSeeded: false, club: "Bordeaux Kendo" },
  { id: "9", isSeeded: false, club: "Toulouse Kendo Kai" },
];
const nbFighters = fighters.length;

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
    shouldSeparateClubMembers,
    shouldSeparateSeededCompetitors,
  );
}
</script>

<!--TEMPORARY: rankingDetails names are defined from fighter ids -->
<!--TODO: need to add name to fighter entry data format-->
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
        <PoolCard
          v-for="pool of pools"
          :key="pool.number"
          :pool-details="poolToPoolDetails(pool)"
          :ranking-details="
            pool.fighters.map((f) => new RankingDetailBuilder().withName(f.fighter.id).build())
          "
        />
      </div>
      <div v-if="!poolsValidated" class="flex justify-end">
        <Button :disabled="pools.length == 0" @click="poolsValidated = true">
          Validate Pools
        </Button>
      </div>
    </section>

    <section v-if="selectedView === 'bracket'">BRACKET</section>
  </div>
</template>

<style scoped></style>
