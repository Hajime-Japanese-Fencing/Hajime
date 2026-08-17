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

const selectedSetup: PoolSetup | null = ref(null);

// -------------------------------------------
// FUNCTIONS
// -------------------------------------------
function poolSetupToDropdownOption(setup: PoolSetup): DropdownOption {
  const poolSize = setup.poolGroups[0].poolSize;
  const nbPools = setup.poolGroups[0].amount;
  let label = `${nbPools} Pools of ${poolSize} Fighters`;

  if (setup.poolGroups.length > 1) {
    const poolSize2 = setup.poolGroups[1].poolSize;
    const nbPools2 = setup.poolGroups[1].amount;
    label += ` & ${nbPools2} Pools of ${poolSize2} Fighters`;
  }

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
