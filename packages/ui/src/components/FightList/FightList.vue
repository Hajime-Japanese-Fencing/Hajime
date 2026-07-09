<script setup lang="ts">
import { computed, ref } from "vue";
import type {Fight, FightSide, AssignIpponEvent, Action} from "./types.ts";
import { FightStatus, Side, SideLabel, AssignableIpponCode } from "@hajime/core";
import SwapButton from "./SwapButton.vue";
import FightRow from "./FightRow.vue";
import IpponAssignButtons from "./IpponAssignButtons.vue";
import IpponResultList from "./IpponResultList.vue";
import RoundButton from "../Actions/Button/RoundButton.vue";
import {BsEye, BsEyeSlash} from "vue-icons-plus/bs";
import {BiArchiveOut} from "vue-icons-plus/bi";
import DropdownComboButton from "./DropdownComboButton.vue";
import IpponResult from "./IpponResult.vue";

const props = defineProps<{
  fights: Fight[];
  activeFightId: number | null;
}>();

const emit = defineEmits<{
  openFight: [id: number];
  closeFight: [id: number];
  cancelFight: [id: number];
  validateFight: [id: number];
  forfeitFight: [id: number];
  assignIppon: [fightId: number, event: AssignIpponEvent];
  removeIppon: [id: number];
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
  console.log(leftSide.value);
  leftSide.value = leftSide.value.side === "RED" ? WhiteFightSide : RedFightSide;
}

function handleAction(action: Action, id: number) {
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
      <FightRow v-for="fight in props.fights"
                :key="fight.id"
                :fight-status="fight.status"
                :active="props.activeFightId === fight.id"
                :left-fighter="fight.fighter1.fighterName"
                :right-fighter="fight.fighter2.fighterName"
                :score="fight.score">

        <template #left-assign>
          <IpponAssignButtons @click=""/>
        </template>
        <template #left-hansoku>
          <IpponResult v-for="n in fight.fighter1.numberOfHansoku" :removable="fight.editable" @remove="">
            AssignableIpponCode.Hansoku
          </IpponResult>
        </template>
        <template #left-score>
          <IpponResultList
              :ippons="fight.fighter1.ipponsGiven"
              :removable="fight.editable"
              @remove=""
          />
        </template>

        <template #right-assign>
          <IpponAssignButtons @click=""/>
        </template>
        <template #right-hansoku>
          <IpponResult v-for="n in fight.fighter2.numberOfHansoku" :removable="fight.editable" @remove="">
            AssignableIpponCode.Hansoku
          </IpponResult>
        </template>
        <template #right-score>
          <IpponResultList
              :ippons="fight.fighter2.ipponsGiven"
              :removable="fight.editable"
              @remove=""
          />
        </template>

        <template #actions-inactive>
          <RoundButton
              size="sm"
              variant="outline"
              @click="emit('openFight', fight.id)"
              :disabled="isLocked(fight)"
              :class="isLocked(fight) ? '' : 'bg-neutral text-neutral-content'"
          >
            <BsEye v-if="fight.status === FightStatus.Finished" />
            <BiArchiveOut v-else />
          </RoundButton>
        </template>
        <template #actions-active>
          <DropdownComboButton
              v-if="fight.status === FightStatus.InProgress"
              :id="fight.id"
              @action="(e) => handleAction(e, fight.id)"
          />
          <RoundButton
              v-else
              size="sm"
              variant="outline"
              class="bg-neutral text-neutral-content"
              @click="emit('closeFight', fight.id)"
          >
            <BsEyeSlash />
          </RoundButton>
        </template>

      </FightRow>

      </tbody>
    </table>
  </div>
</template>
