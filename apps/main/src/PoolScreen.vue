<script setup lang="ts">
import { type SelectorItem, SelectorList } from "@hajime/ui";
import { computed, ref } from "vue";
import { poolToPoolDetails } from "./pre-competition/poolToPoolDetails.mapper.ts";
import type { Pool } from "@hajime/core";
import { RankingDetailBuilder } from "@hajime/ui";
import { PoolCard } from "@hajime/ui";
import FightScreen from "./FightScreen.vue";

// -------------------------------------------
// INPUTS
// -------------------------------------------

const testPools: Pool[] = [
  {
    number: 1,
    size: 3,
    fighters: [
      { fighter: { id: "1", isSeeded: false, club: "Unknown club" } },
      { fighter: { id: "2", isSeeded: false, club: "Unknown club" } },
      { fighter: { id: "3", isSeeded: false, club: "Unknown club" } },
    ],
  },
  {
    number: 2,
    size: 3,
    fighters: [
      { fighter: { id: "4", isSeeded: false, club: "Unknown club" } },
      { fighter: { id: "5", isSeeded: false, club: "Unknown club" } },
      { fighter: { id: "6", isSeeded: false, club: "Unknown club" } },
    ],
  },
  {
    number: 3,
    size: 3,
    fighters: [
      { fighter: { id: "7", isSeeded: false, club: "Unknown club" } },
      { fighter: { id: "8", isSeeded: false, club: "Unknown club" } },
      { fighter: { id: "9", isSeeded: false, club: "Unknown club" } },
    ],
  },
];

const pools: Pool[] = testPools;

const selectors = computed<SelectorItem[]>(() => [
  { id: "pools", label: "Pools" },
  { id: "fights", label: "Fights" },
]);
const selectedView = ref<string>("pools");

// -------------------------------------------
// FUNCTIONS
// -------------------------------------------
</script>

<!--TEMPORARY: rankingDetails names are defined from fighter ids -->
<!--TODO: need to add name to fighter entry data format-->
<template>
  <div class="flex gap-4">
    <SelectorList :items="selectors" v-model="selectedView" />

    <section v-if="selectedView === 'pools'" class="flex flex-1 flex-col gap-1 justify-between">
      <div>Pool Repartition</div>
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
    </section>

    <section v-if="selectedView === 'bracket'">
      <FightScreen competitionId="1" />
    </section>
  </div>
</template>

<style scoped></style>
