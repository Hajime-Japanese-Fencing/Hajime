r<script setup lang="ts">

import { BiArchiveOut } from 'vue-icons-plus/bi'
import { BsEye, BsEyeSlash } from 'vue-icons-plus/bs'
import IpponButtons from "./IpponButtons.vue";
import DropdownComboButton from "./DropdownComboButton.vue";
import Badge from "./Badge.vue";
import RoundButton from "../Button/RoundButton.vue";

interface Fight {
  id: number;
  fighter1: string;
  fighter2: string;
  score: string | null;
  status: string;
}

type Action = "validate" | "cancel" | "forfeit";
type BadgeColor = "primary" | "secondary" | "accent" | "neutral" | "success" | "info" | "warning" | "error";

type Side = {
  label: "Red" | "White"
  bgClass: string
  textClass: string
}

const props = defineProps<{
  fight: Fight;
  active: boolean;
  locked: boolean;
  leftSide: Side;
  rightSide: Side;
}>();

const emit = defineEmits<{
  (e: "openFight", id: number): void;
  (e: "closeFight"): void;
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

function handleAction(action: Action) {
  switch (action) {
    case "validate":
      emit("validateFight", props.fight.id);
      break;

    case "cancel":
      emit("cancelFight", props.fight.id);
      break;

    case "forfeit":
      emit("forfeitFight", props.fight.id);
      break;
  }
}

function onOpenFight() {
  emit("openFight", props.fight.id);
}

function onCloseFight() {
  emit("closeFight");
}

const statusColors: Record<string, BadgeColor> = {
  "Waiting": "info",
  "In progress": "accent",
  "Finished": "success",
};


</script>

<template>
  <tr :class="[props.active ? 'bg-base-200  ' : 'hover:bg-base-200']">

    <td class="p-0" :class="[props.leftSide.bgClass, props.leftSide.textClass]">
      <div :class="props.active ? 'grid grid-rows-[auto_1fr_auto] h-full' : ''">

        <div class="grid grid-cols-[auto_1fr] items-center" >
          <!-- Boutons -->
          <div class="w-48 pt-1">
            <span v-if="props.active" class="gap-2">
              <IpponButtons @addIppon="addLeftIppon" :textColor="props.leftSide.textClass"/>
            </span>
          </div>
          <!-- Nom -->
          <span class="text-right font-medium justify-self-end">
            {{ props.fight.fighter1 }}
          </span>
        </div>

        <!-- Hansoku -->
        <div class="flex justify-start gap-2 mt-4" v-if="props.active">
          <span class="btn btn-circle btn-sm btn-ghost" :class="props.leftSide.textClass">
            Δ
          </span>
        </div>

      </div>
    </td>

    <td class="w-40 relative p-0">
      <!-- Background -->
      <div class="absolute inset-0 grid grid-cols-2 pointer-events-none">
        <div :class="props.leftSide.bgClass"></div>
        <div :class="props.rightSide.bgClass"></div>
      </div>

      <!-- Content -->
      <div class="relative z-10 h-full">

        <div v-if="props.active" class="flex flex-col items-center justify-center h-full py-2 gap-2">
          <div class="font-semibold leading-none">
            {{ props.fight.score ?? "VS" }}
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
          {{ props.fight.score ?? "VS" }}
        </div>

      </div>
    </td>

    <td class="p-0" :class="[props.rightSide.bgClass, props.rightSide.textClass]">
      <div :class="props.active ? 'grid grid-rows-[auto_1fr_auto] h-full' : ''">

        <div class="grid grid-cols-[1fr_auto] items-center">
          <!-- Nom -->
          <span class="text-left font-medium justify-self-start">
            {{ props.fight.fighter2 }}
          </span>
          <!-- Boutons -->
          <div class="w-48 pt-1">
            <span v-if="props.active" class="gap-2">
              <IpponButtons @addIppon="addRightIppon" :textColor="props.rightSide.textClass"/>
            </span>
          </div>

        </div>

        <!-- Hansoku -->
        <div class="flex justify-end gap-2 mt-4" v-if="props.active">
          <div class="btn btn-circle btn-sm btn-ghost" :class="props.rightSide.textClass">
            Δ
          </div>
        </div>
      </div>
    </td>

    <td class="">
      <Badge :color="statusColors[props.fight.status]" variant="outline">
        {{ props.fight.status }}
      </Badge>
    </td>

    <td class="">
      <div v-if="!props.active" class="flex justify-center">
        <RoundButton
            size="sm"
            variant="outline"
            @click="onOpenFight"
            :disabled="props.locked"
            :class="props.locked ? '' : 'bg-neutral text-neutral-content'"
        >
          <BsEye v-if="props.fight.status === 'Finished'" />
          <BiArchiveOut v-else />
        </RoundButton>
      </div>

      <div v-else class="flex flex-col gap-3 items-center justify-center">
        <DropdownComboButton
            v-if="props.fight.status === 'In progress'"
            :id="props.fight.id"
            @action="handleAction"
        />
        <RoundButton
            v-else
            size="sm"
            variant="outline"
            class="bg-neutral text-neutral-content"
            @click="onCloseFight"
        >
          <BsEyeSlash />
        </RoundButton>
      </div>

    </td>

  </tr>
</template>

<style scoped>

</style>