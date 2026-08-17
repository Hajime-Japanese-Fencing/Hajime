<script setup lang="ts">
import { type SelectorItem, SelectorList } from "@hajime/ui";
import { Dropdown } from "@hajime/ui";

const selectors: SelectorItem[] = [
  { id: "1", label: "Pools" },
  { id: "2", label: "Bracket", disabled: true },
];

const testTitle = "Menu";
const testOptions = ["option 1", "option 2"];

function onDropdownSelect(id: string) {}
</script>

<template>
  <div class="flex gap-4">
    <SelectorList :items="selectors" />
    <div class="flex justify-between">
      <div>Pool Repartition</div>
      <Dropdown :title="testTitle" :options="testOptions" @select="onDropdownSelect" />
    </div>
  </div>
</template>

<style scoped></style>
