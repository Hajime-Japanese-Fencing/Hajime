<script setup lang="ts">
import { type SelectorItem, SelectorList } from "@hajime/ui";
import { computed, ref } from "vue";
import { poolToPoolDetails } from "./pre-competition/poolToPoolDetails.mapper.ts";
import { RankingDetailBuilder } from "@hajime/ui";
import { PoolCard } from "@hajime/ui";
import FightScreen from "./FightScreen.vue";
import { useContainer } from "./bootstrap/container/useContainer.ts";
import { useActiveCompetition } from "./features/active-competition/composables/use-active-competition.ts";
import { recordToPool } from "./pre-competition/pool-record.mapper.ts";

// -------------------------------------------
// INPUTS
// -------------------------------------------

// const testPools: Pool[] = [
//   {
//     number: 1,
//     size: 3,
//     fighters: [
//       {
//         fighter: {
//           id: makeFighterId("1"),
//           name: "Fighter1",
//           isSeeded: false,
//           club: "Unknown club",
//         },
//       },
//       {
//         fighter: {
//           id: makeFighterId("2"),
//           name: "Fighter2",
//           isSeeded: false,
//           club: "Unknown club",
//         },
//       },
//       {
//         fighter: {
//           id: makeFighterId("3"),
//           name: "Fighter3",
//           isSeeded: false,
//           club: "Unknown club",
//         },
//       },
//     ],
//   },
//   {
//     number: 2,
//     size: 3,
//     fighters: [
//       {
//         fighter: {
//           id: makeFighterId("4"),
//           name: "Fighter1",
//           isSeeded: false,
//           club: "Unknown club",
//         },
//       },
//       {
//         fighter: {
//           id: makeFighterId("5"),
//           name: "Fighter2",
//           isSeeded: false,
//           club: "Unknown club",
//         },
//       },
//       {
//         fighter: {
//           id: makeFighterId("6"),
//           name: "Fighter3",
//           isSeeded: false,
//           club: "Unknown club",
//         },
//       },
//     ],
//   },
//   {
//     number: 3,
//     size: 3,
//     fighters: [
//       {
//         fighter: {
//           id: makeFighterId("7"),
//           name: "Fighter1",
//           isSeeded: false,
//           club: "Unknown club",
//         },
//       },
//       {
//         fighter: {
//           id: makeFighterId("8"),
//           name: "Fighter2",
//           isSeeded: false,
//           club: "Unknown club",
//         },
//       },
//       {
//         fighter: {
//           id: makeFighterId("9"),
//           name: "Fighter3",
//           isSeeded: false,
//           club: "Unknown club",
//         },
//       },
//     ],
//   },
// ];

defineProps<{
  competitionId: string;
}>();

const container = useContainer();
const { pools: poolRecords } = useActiveCompetition(container.activeCompetition);

const pools = computed(() =>
  poolRecords.value.map((record, i) =>
    recordToPool(record, i + 1, (id) => container.activeCompetition.view.state.fighter(id)),
  ),
);

const selectors = computed<SelectorItem[]>(() => [
  { id: "fights", label: "Fights" },
  { id: "pools", label: "Pools" },
]);
const selectedView = ref<string>("fights");

// -------------------------------------------
// FUNCTIONS
// -------------------------------------------
</script>

<template>
  <div class="flex gap-4">
    <SelectorList :items="selectors" v-model="selectedView" />

    <section v-if="selectedView == 'pools'" class="flex flex-1 flex-col gap-1 justify-between">
      <div>Pool Repartition</div>
      <div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(18rem,1fr))]">
        <PoolCard
          v-for="pool of pools"
          :key="pool.number"
          :pool-details="poolToPoolDetails(pool)"
          :ranking-details="
            pool.fighters.map((f) => new RankingDetailBuilder().withName(f.fighter.name).build())
          "
        />
      </div>
    </section>

    <section v-if="selectedView == 'fights'">
      <FightScreen :competitionId="competitionId" />
    </section>
  </div>
</template>

<style scoped></style>
