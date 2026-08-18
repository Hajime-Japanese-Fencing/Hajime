<script setup lang="ts">
import { type SelectorItem, SelectorList } from "@hajime/ui";
import { Dropdown } from "@hajime/ui";
import type { DropdownOption } from "@hajime/ui";
import { ref } from "vue";
import type { PoolSetup } from "@hajime/core";
import { calculatePossiblePoolSetups } from "@hajime/core";

const selectors: SelectorItem[] = [
  { id: "1", label: "Pools" },
  { id: "2", label: "Bracket", disabled: true },
];

const nbFighters = 12;

const title = ref("Select a pool repartition");

const options: DropdownOption[] = calculatePossiblePoolSetups(nbFighters).map(
  (poolSetup: PoolSetup) => poolSetupToDropdownOption(poolSetup),
);

const selectedSetup = ref<PoolSetup | null>(null);

// -------------------------------------------
// FUNCTIONS
// -------------------------------------------
function poolSetupToDropdownOption(setup: PoolSetup): DropdownOption {
  let label = "";
  setup.poolGroups.forEach((pool, index) => {
    label += `${index > 1 ? " &" : ""} ${pool.amount} Pools of ${pool.poolSize} Fighters`;
  });

  return {
    label: label + ` (${setup.fightCount} Fights)`,
    return: () => {
      return setup;
    },
  };
}

function onDropdownSelect(option: DropdownOption) {
  title.value = option.label;
  option.return();
}
</script>

<template>
  <div class="flex gap-4">
    <SelectorList :items="selectors" />
    <div class="flex-column justify-between">
      <div>Pool Repartition</div>
      <Dropdown :title="title" :options="options" @select="onDropdownSelect" />
      <div></div>
    </div>
  </div>
</template>

<style scoped></style>
