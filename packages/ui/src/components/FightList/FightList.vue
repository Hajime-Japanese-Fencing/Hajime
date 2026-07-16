<script setup lang="ts">
import { computed, ref } from "vue";
import type { Fight, FightSide, AssignIpponEvent, Action } from "./types.ts";
import { FightStatus, Side, SideLabel, AssignableIpponCode, hansoku } from "@hajime/core";
import SwapButton from "./SwapButton.vue";
import FightRow from "./FightRow.vue";
import IpponAssignButtons from "./IpponAssignButtons.vue";
import IpponResultList from "./IpponResultList.vue";
import IconButton from "../Actions/Button/IconButton.vue";
import { ArchiveRestore, Eye, EyeOff } from "lucide-vue-next";
import DropdownComboButton from "./DropdownComboButton.vue";
import IpponResult from "./IpponResult.vue";
import AssignButton from "./AssignButton.vue";

const props = defineProps<{
  fights: Fight[];
  activeFightId: number | null;
}>();

const emit = defineEmits<{
  openFight: [fightId: number];
  closeFight: [fightId: number];
  cancelFight: [fightId: number];
  validateFight: [fightId: number];
  forfeitFight: [fightId: number];
  assignIppon: [fightId: number, event: AssignIpponEvent];
  removeIppon: [fightId: number, ipponId: number];
  assignHansoku: [fightId: number, side: Side];
  removeHansoku: [fightId: number, side: Side];
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

function isLocked(fight: Fight): boolean {
  return !!props.activeFightId && props.activeFightId !== fight.id;
}

function swapColors() {
  leftSide.value = leftSide.value.side === "RED" ? WhiteFightSide : RedFightSide;
}

function handleAction(action: Action, id: number) {
  // Close the UI element
  openedFightId.value = null;

  // emit the correct event
  switch (action) {
    case "validate":
      emit("validateFight", id);
      break;

    case "cancel":
      emit("cancelFight", id);
      break;

    case "forfeit":
      emit("forfeitFight", id);
      break;
  }
}

/*
 * Manages the state of opened fight UI-side (doesn't necessarily mean the fight is active)
 */
const openedFightId = ref<number | null>(null);

function openFight(fight: Fight) {
  openedFightId.value = fight.id;

  if (fight.editable) {
    emit("openFight", fight.id);
  }
}

function closeFight(fight: Fight) {
  openedFightId.value = null;

  if (fight.editable) {
    emit("closeFight", fight.id);
  }
}

function assignIppon(fightId: number, side: Side, code: AssignableIpponCode) {
  emit("assignIppon", fightId, {
    side,
    code,
  });
}

function removeIppon(fightId: number, ipponId: number) {
  emit("removeIppon", fightId, ipponId);
}

function assignHansoku(fightId: number, side: Side) {
  emit("assignHansoku", fightId, side);
}

function removeHansoku(fightId: number, side: Side) {
  emit("removeHansoku", fightId, side);
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
          v-for="fight in props.fights"
          :key="fight.id"
          :fight-status="fight.status"
          :open="openedFightId === fight.id"
          :left-fighter="fight.fighter1.fighterName"
          :right-fighter="fight.fighter2.fighterName"
          :score="fight.score"
        >
          <template #left-assign>
            <div class="flex gap-2">
              <IpponAssignButtons
                @assign="(code) => assignIppon(fight.id, leftSide.side, code)"
                v-if="fight.editable"
              />
              <AssignButton
                :tooltip="hansoku.label"
                @assign="assignHansoku(fight.id, leftSide.side)"
                v-if="fight.editable"
              >
                {{ hansoku.code }}
              </AssignButton>
            </div>
          </template>
          <template #left-hansoku>
            <IpponResult
              v-for="_ in fight.fighter1.numberOfHansoku"
              :removable="fight.editable"
              @remove="removeHansoku(fight.id, leftSide.side)"
            >
              {{ AssignableIpponCode.Hansoku }}
            </IpponResult>
          </template>
          <template #left-score>
            <IpponResultList
              :ippons="fight.fighter1.ipponsGiven"
              :removable="fight.editable"
              alignment="end"
              @remove="(id) => removeIppon(fight.id, id)"
            />
          </template>

          <template #right-assign>
            <div class="flex gap-2">
              <IpponAssignButtons
                @assign="(code) => assignIppon(fight.id, rightSide.side, code)"
                v-if="fight.editable"
              />
              <AssignButton
                :tooltip="hansoku.label"
                @assign="assignHansoku(fight.id, rightSide.side)"
                v-if="fight.editable"
              >
                {{ hansoku.code }}
              </AssignButton>
            </div>
          </template>
          <template #right-hansoku>
            <IpponResult
              v-for="_ in fight.fighter2.numberOfHansoku"
              :removable="fight.editable"
              @remove="removeHansoku(fight.id, rightSide.side)"
            >
              {{ AssignableIpponCode.Hansoku }}
            </IpponResult>
          </template>
          <template #right-score>
            <IpponResultList
              :ippons="fight.fighter2.ipponsGiven"
              :removable="fight.editable"
              alignment="start"
              @remove="(id) => removeIppon(fight.id, id)"
            />
          </template>

          <template #actions-inactive>
            <IconButton variant="outline" @click="openFight(fight)" :disabled="isLocked(fight)">
              <Eye v-if="fight.status === FightStatus.Finished" />
              <ArchiveRestore v-else />
            </IconButton>
          </template>
          <template #actions-active>
            <DropdownComboButton
              v-if="fight.status === FightStatus.InProgress"
              :id="fight.id"
              @action="(e) => handleAction(e, fight.id)"
            />
            <IconButton v-else variant="outline" @click="closeFight(fight)">
              <EyeOff />
            </IconButton>
          </template>
        </FightRow>
      </tbody>
    </table>
  </div>
</template>
