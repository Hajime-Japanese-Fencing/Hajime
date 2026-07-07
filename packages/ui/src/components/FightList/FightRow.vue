r<script setup lang="ts">

import { BiArchiveOut } from 'vue-icons-plus/bi'
import { BsEye } from 'vue-icons-plus/bs'
import IpponButtons from "./IpponButtons.vue";
import DropdownComboButton from "./DropdownComboButton.vue";
import Badge from "./Badge.vue";
import RoundButton from "../Button/RoundButton.vue";
import {CgArrowsExchange} from "vue-icons-plus/cg";

interface Fight {
  id: number;
  fighter1: string;
  fighter2: string;
  score: string | null;
  status: string;
}

type Action = "validate" | "cancel" | "forfeit";
type BadgeColor = "primary" | "secondary" | "accent" | "neutral" | "success" | "info" | "warning" | "error";

defineProps<{
  fight: Fight;
  active: boolean;
  leftSide: Side;
  rightSide: Side;
}>();

const emit = defineEmits<{
  (e: "toggleFight", id: number): void;
  (e: "cancelFight", id: number): void;
  (e: "validateFight", id: number): void;
  (e: "forfeitFight", id: number): void;
}>();

function addLeftIppon(code: string) {
  console.log("left", code);
}

function addRightIppon(code: string) {
  console.log("right", code);
}

function handleAction(id: number, action: Action) {
  switch (action) {
    case "validate":
      emit("validateFight", id)
      break;
    case "cancel":
      emit("cancelFight", id)
      break;
    case "forfeit":
      emit("forfeitFight", id)
      break;
  }
}

const statusColors: Record<string, BadgeColor> = {
  "Waiting": "info",
  "In progress": "accent",
  "Finished": "success",
};

type Side = {
  label: "Red" | "White"
  bgClass: string
  textClass: string
}

</script>

<template>
  <tr :class="[active ? 'bg-base-200  ' : 'hover:bg-base-200']">

    <td class="align-top p-0" :class="[leftSide.bgClass, leftSide.textClass]">
      <div class="grid grid-rows-[auto_1fr_auto] h-full">

        <div class="grid grid-cols-[auto_1fr] items-center">
          <!-- Boutons -->
          <div class="w-48 pt-1">
            <span v-if="active" class="gap-2">
              <IpponButtons @addIppon="addLeftIppon" :textColor="leftSide.textClass"/>
            </span>
          </div>
          <!-- Nom -->
          <span class="text-right font-medium justify-self-end">
            {{ fight.fighter1 }}
          </span>
        </div>

        <!-- Hansoku -->
        <div class="flex justify-start gap-2 mt-4" v-if="active">
          <span class="btn btn-circle btn-sm btn-ghost" :class="leftSide.textClass">
            Δ
          </span>
        </div>

      </div>
    </td>

    <td class="w-40 relative p-0">
      <!-- Background -->
      <div class="absolute inset-0 grid grid-cols-2 pointer-events-none">
        <div :class="leftSide.bgClass"></div>
        <div :class="rightSide.bgClass"></div>
      </div>

      <!-- Content -->
      <div class="relative z-10 h-full">

        <div v-if="active" class="flex flex-col items-center justify-center h-full py-2 gap-2">
          <div class="font-semibold leading-none">
            {{ fight.score ?? "VS" }}
          </div>

          <div class="grid grid-cols-[1fr_auto_1fr] items-center w-full">
            <div class="flex justify-end gap-2 mr-2">
              <span class="btn btn-circle btn-sm btn-ghost">K</span>
              <span class="btn btn-circle btn-sm btn-outline">M</span>
            </div>

            <div></div>

            <div class="flex justify-start gap-2 ml-2">
              <span class="btn btn-circle btn-sm btn-ghost">D</span>
            </div>
          </div>
        </div>

        <div v-else class="flex items-center justify-center h-full font-semibold">
          {{ fight.score ?? "VS" }}
        </div>

      </div>
    </td>

    <td class="align-top p-0" :class="[rightSide.bgClass, rightSide.textClass]">
      <div class="grid grid-rows-[auto_1fr_auto] h-full">

        <div class="grid grid-cols-[1fr_auto] items-center">
          <!-- Nom -->
          <span class="text-left font-medium justify-self-start">
            {{ fight.fighter2 }}
          </span>
          <!-- Boutons -->
          <div class="w-48 pt-1">
            <span v-if="active" class="gap-2">
              <IpponButtons @addIppon="addRightIppon" :textColor="rightSide.textClass"/>
            </span>
          </div>

        </div>

        <!-- Hansoku -->
        <div class="flex justify-end gap-2 mt-4" v-if="active">
          <div class="btn btn-circle btn-sm btn-ghost" :class="rightSide.textClass">
            Δ
          </div>
        </div>
      </div>
    </td>

    <td class="align-top">
      <Badge :color="statusColors[fight.status]" variant="outline">
        {{ fight.status }}
      </Badge>
    </td>

    <td class="align-top">
      <div v-if="!active" class="flex justify-center">
        <RoundButton size="sm" variant="outline" @click="emit('toggleFight', fight.id)" class="bg-neutral text-neutral-content">
          <BsEye v-if="fight.status=='Finished'"/>
          <BiArchiveOut v-if="fight.status=='Waiting'"/>
        </RoundButton>
      </div>
      <div v-else class="flex flex-col gap-3 items-center justify-center ">
        <DropdownComboButton :id="fight.id" @action="handleAction"/>
      </div>

    </td>

  </tr>
</template>

<style scoped>

</style>