<script setup lang="ts">
import FightRow from "./FightRow.vue";
import { computed, ref } from "vue";
import type { Fight, FightSide, AssignIpponEvent } from "./types.ts";
import { Side, SideLabel } from "@hajime/core";
import SwapButton from "./SwapButton.vue";

const props = defineProps<{
  fights: Fight[];
  activeFightId: number | null;
}>();

const emit = defineEmits<{
  openFight: [id: number];
  closeFight: [];
  cancelFight: [id: number];
  validateFight: [id: number];
  forfeitFight: [id: number];
  assignIppon: [fightId: number, event: AssignIpponEvent];
}>();

const RedFightSide: FightSide = {
  side: Side.Red,
  label: SideLabel.RED,
  class: "border-b-8 border-b-red-400",
};

const WhiteFightSide: FightSide = {
  side: Side.White,
  label: SideLabel.WHITE,
  class: "border-b-8 border-white",
};

const leftSide = ref<FightSide>(RedFightSide);
const rightSide = computed(() => (leftSide.value.side === "RED" ? WhiteFightSide : RedFightSide));

function onOpenFight(id: number) {
  emit("openFight", id);
}

function onCloseFight() {
  emit("closeFight");
}

function onCancelFight(id: number) {
  emit("cancelFight", id);
}

function onValidateFight(id: number) {
  emit("validateFight", id);
}

function onForfeitFight(id: number) {
  emit("forfeitFight", id);
}

function isLocked(fight: Fight): boolean {
  return !!props.activeFightId && props.activeFightId !== fight.id;
}

function swapColors() {
  console.log(leftSide.value);
  leftSide.value = leftSide.value.side === "RED" ? WhiteFightSide : RedFightSide;
}
</script>

<template>
  <div class="bg-base-300">
    <table class="table table-zebra">
      <thead>
        <tr>
          <th class="text-right p-0" :class="leftSide.class">
            {{ leftSide.label }}
          </th>
          <th class="text-center w-40 relative p-0">
            <div class="relative z-10 flex items-center justify-center h-12">
              <span>
                <SwapButton @click="swapColors" />
              </span>
            </div>
          </th>
          <th class="text-left p-0" :class="rightSide.class">
            <div>
              {{ rightSide.label }}
            </div>
          </th>
          <th class="w-px whitespace-nowrap">Status</th>
          <th class=""></th>
        </tr>
      </thead>
      <tbody>
        <FightRow
          :fight="fight"
          :active="props.activeFightId === fight.id"
          :locked="isLocked(fight)"
          @openFight="onOpenFight"
          @closeFight="onCloseFight"
          @cancelFight="onCancelFight"
          @validateFight="onValidateFight"
          @forfeitFight="onForfeitFight"
          v-for="fight in props.fights"
          :key="fight.id"
          :leftSide="leftSide.side"
          :rightSide="rightSide.side"
          @assignIppon="(event) => emit('assignIppon', fight.id, event)"
        />
      </tbody>
    </table>
  </div>
</template>
