<script setup lang="ts">
import { type SelectorItem, SelectorList } from "@hajime/ui";
import { Dropdown } from "@hajime/ui";
import type { DropdownOption } from "@hajime/ui";
import { ref } from "vue";

const selectors: SelectorItem[] = [
  { id: "1", label: "Pools" },
  { id: "2", label: "Bracket", disabled: true },
];

const nbFighters = 12;

function testFunc() {
  console.log("function called");
}
const testTitle: string = "Menu";
const testOptions: DropdownOption[] = [
  {
    label: "option 1",
    return: testFunc,
  },
  {
    label: "option 2",
    return: testFunc,
  },
  {
    label: "option 3",
    return: testFunc,
  },
];

const title = ref("Default");

function onDropdownSelect(option: DropdownOption) {
  title.value = option.label;
  console.log(title);
  option.return();
}
</script>

<template>
  <div class="flex gap-4">
    <SelectorList :items="selectors" />
    <div class="flex-column justify-between">
      <div>Pool Repartition</div>
      <Dropdown :title="title" :options="testOptions" @select="onDropdownSelect" />
    </div>
  </div>
</template>

<style scoped></style>
