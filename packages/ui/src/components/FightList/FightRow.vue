<script setup lang="ts">

import { BiArchiveOut } from 'vue-icons-plus/bi'
import { BsEye } from 'vue-icons-plus/bs'
import IpponButtons from "./IpponButtons.vue";
import DropdownComboButton from "./DropdownComboButton.vue";
import Badge from "./Badge.vue";

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

</script>

<template>
  <tr :class="[active ? 'bg-base-200 outline-2 outline-base-300' : 'hover:bg-base-200']">

    <td class="align-top">
      <div class="grid grid-rows-[auto_1fr_auto] h-full">

        <div class="grid grid-cols-[auto_1fr] items-center">
          <!-- Boutons -->
          <div class="w-48">
            <span v-if="active" class="gap-2">
              <IpponButtons @addIppon="addLeftIppon"/>
            </span>
          </div>
          <!-- Nom -->
          <span class="text-right font-medium justify-self-end">
            {{ fight.fighter1 }}
          </span>
        </div>

        <!-- Hansoku -->
        <div class="flex justify-start gap-2 mt-4" v-if="active">
          <span class="btn btn-circle btn-sm btn-ghost">
            Δ
          </span>
        </div>

      </div>
    </td>

    <td class="w-40 align-top">
      <div class="grid grid-rows-[auto_1fr_auto]">
        <div class="text-center font-semibold">
          {{ fight.score ?? "VS" }}
        </div>
        <div v-if="active" class="grid grid-cols-[1fr_auto_1fr] items-center mt-4">
          <!-- Ippons left fighter -->
          <div class="flex justify-end gap-2 mr-3">
            <span class="btn btn-circle btn-md btn-ghost">K</span>
            <span class="btn btn-circle btn-md btn-outline">M</span>
          </div>
          <div></div>
          <!-- Ippons right fighter -->
          <div class="flex justify-start gap-2 ml-3">
            <span class="btn btn-circle btn-md btn-ghost">D</span>
          </div>
        </div>
      </div>
    </td>

    <td class="align-top">
      <div class="grid grid-rows-[auto_1fr_auto] h-full">

        <div class="grid grid-cols-[1fr_auto] items-center">
          <!-- Nom -->
          <span class="text-left font-medium justify-self-start">
            {{ fight.fighter2 }}
          </span>
          <!-- Boutons -->
          <div class="w-48">
            <span v-if="active" class="gap-2">
              <IpponButtons @addIppon="addRightIppon"/>
            </span>
          </div>

        </div>

        <!-- Hansoku -->
        <div class="flex justify-end gap-2 mt-4" v-if="active">
          <div class="btn btn-circle btn-sm btn-ghost">
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
        <button class="btn btn-ghost btn-xs" @click="emit('toggleFight', fight.id)">
          <BsEye v-if="fight.status=='Finished'"/>
          <BiArchiveOut v-if="fight.status=='Waiting'"/>
        </button>
      </div>
      <div v-else class="flex flex-col gap-3 items-center justify-center ">
        <DropdownComboButton :id="fight.id" @action="handleAction"/>
      </div>

    </td>

  </tr>
</template>

<style scoped>

</style>