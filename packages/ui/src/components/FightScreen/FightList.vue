<script setup lang="ts">
import { CgArrowsExchange } from "vue-icons-plus/cg";
import FightRow from "./FightRow.vue";
import { computed, ref } from "vue";
import RoundButton from "../Button/RoundButton.vue";
import type { Fight, FightSide, AssignIpponEvent } from "./fight.interface.ts";
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
  bgClass: "bg-error",
  textClass: "text-error-content",
};

const WhiteFightSide: FightSide = {
  side: Side.White,
  label: SideLabel.WHITE,
  bgClass: "bg-base-100",
  textClass: "text-base-content",
};

const leftSide = ref<FightSide>(RedFightSide);
const rightSide = computed(() => (leftSide.value.label === "Red" ? WhiteFightSide : RedFightSide));

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
  leftSide.value = leftSide.value.label === "Red" ? WhiteFightSide : RedFightSide;
}
</script>

<template>
  <div class="rounded-box border bg-base-200 tb-border">
    <table class="table">
      <thead>
        <tr>
          <th class="text-right p-0" :class="[leftSide.bgClass, leftSide.textClass]">
            <div>
              {{ leftSide.label }}
            </div>
          </th>
          <th class="text-center w-40 relative p-0">
            <div class="grid grid-cols-2 absolute inset-0">
              <div :class="leftSide.bgClass"></div>
              <div :class="rightSide.bgClass"></div>
            </div>

            <div class="relative z-10 flex items-center justify-center h-12">
              <span>
                <SwapButton @click="swapColors" />
              </span>
            </div>
          </th>
          <th class="text-left p-0" :class="[rightSide.bgClass, rightSide.textClass]">
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

<style scoped>
.table th,
.tb-border {
  border-color: #33333340;
}
</style>
