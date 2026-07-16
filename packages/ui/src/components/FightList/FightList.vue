<script setup lang="ts">
import { computed, ref } from "vue";
import type { Fight, FightSide, AssignIpponEvent, Action } from "./types.ts";
import type { ScoreEvent, ScoreEventId, FightId } from "@hajime/core";
import { FightStatus, Side, SideLabel, AssignableIpponCode, hansoku } from "@hajime/core";
import SwapButton from "./SwapButton.vue";
import FightRow from "./FightRow.vue";
import IpponAssignButtons from "./IpponAssignButtons.vue";
import IpponResultList from "./IpponResultList.vue";
import IconButton from "../Actions/Button/IconButton.vue";
import { ArchiveRestore, Eye, EyeOff } from "lucide-vue-next";
import DropdownComboButton from "./DropdownComboButton.vue";
import AssignButton from "./AssignButton.vue";

const props = defineProps<{
  fights: Fight[];
  activeFightId: FightId | null;
}>();

const emit = defineEmits<{
  openFight: [fightId: FightId];
  closeFight: [fightId: FightId];
  cancelFight: [fightId: FightId];
  validateFight: [fightId: FightId];
  forfeitFight: [fightId: FightId];
  assignIppon: [fightId: FightId, event: AssignIpponEvent];
  removeIppon: [fightId: FightId, scoreEventId: ScoreEventId];
  assignHansoku: [fightId: FightId, side: Side];
  removeHansoku: [fightId: FightId, scoreEventId: ScoreEventId];
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

function handleAction(action: Action, id: FightId) {
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
const openedFightId = ref<FightId | null>(null);

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

function assignIppon(fightId: FightId, side: Side, code: AssignableIpponCode) {
  emit("assignIppon", fightId, {
    side,
    code,
  });
}

function removeIppon(fightId: FightId, eventId: ScoreEventId) {
  emit("removeIppon", fightId, eventId);
}

function assignHansoku(fightId: FightId, side: Side) {
  emit("assignHansoku", fightId, side);
}

function removeHansoku(fightId: FightId, eventId: ScoreEventId) {
  emit("removeHansoku", fightId, eventId);
}

function getIppons(fight: Fight, side: Side): ScoreEvent[] {
  const fighterId = side === Side.Red ? fight.fighter1.fighterId : fight.fighter2.fighterId;

  return fight.scoreEvents.filter((e) => e.type === "ippon" && e.fighterId === fighterId);
}

function getHansoku(fight: Fight, side: Side): ScoreEvent[] {
  const fighterId = side === Side.Red ? fight.fighter1.fighterId : fight.fighter2.fighterId;

  return fight.scoreEvents.filter((e) => e.type === "hansoku" && e.fighterId === fighterId);
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
            <IpponResultList
              :events="getHansoku(fight, leftSide.side)"
              :removable="fight.editable"
              alignment="start"
              @remove="(id) => removeHansoku(fight.id, id)"
            />
          </template>
          <template #left-score>
            <IpponResultList
              :events="getIppons(fight, leftSide.side)"
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
            <IpponResultList
              :events="getHansoku(fight, rightSide.side)"
              :removable="fight.editable"
              alignment="end"
              @remove="(id) => removeHansoku(fight.id, id)"
            />
          </template>
          <template #right-score>
            <IpponResultList
              :events="getIppons(fight, rightSide.side)"
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
