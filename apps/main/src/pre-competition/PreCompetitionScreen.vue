<script setup lang="ts">
import { type SelectorItem, SelectorList } from "@hajime/ui";
import { Dropdown } from "@hajime/ui";
import type { DropdownOption } from "@hajime/ui";
import { ref } from "vue";
import type { PoolSetup } from "@hajime/core";
import { calculatePossiblePoolSetups } from "@hajime/core";
import { distributeFightersInPools, type FighterEntry } from "@hajime/core";
import { poolToPoolDetails } from "./poolToPoolDetails.mapper.ts";
import type { Pool } from "@hajime/core";
import { RankingDetailBuilder } from "@hajime/ui";
import { PoolCard } from "@hajime/ui";
import { poolSetupToDropdownOption } from "./poolSetupToDropdownOption.mapper.ts";

// -------------------------------------------
// INPUTS
// -------------------------------------------

const selectors: SelectorItem[] = [
  { id: "1", label: "Pools" },
  { id: "2", label: "Bracket", disabled: true },
];
const shouldSeparateClubMembers = false;
const shouldSeparateSeededCompetitors = false;

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

const selectedSetup = ref<PoolSetup>({ poolGroups: [], fightCount: 0 });
const pools = ref<Pool[]>([]);

// -------------------------------------------
// FUNCTIONS
// -------------------------------------------

// TO ISOLATE IN AN "ADAPTER" TYPE FILE PROBABLY ?

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
    <SelectorList :items="selectors" />
    <div class="flex-column justify-between">
      <div>Pool Repartition</div>
      <Dropdown :title="title" :options="options" @select="onDropdownSelect" />
      <div class="grid">
        <PoolCard
          v-for="pool of pools"
          :pool-details="poolToPoolDetails(pool)"
          :ranking-details="
            pool.fighters.map((f) => new RankingDetailBuilder().withName(f.fighter.id).build())
          "
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
