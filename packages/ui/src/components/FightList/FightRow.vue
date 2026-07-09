<script setup lang="ts">
import Badge from "../DataDisplay/Badge.vue";
import { StatusColor } from "./types.ts";
import { FightStatus, FightStatusLabel } from "@hajime/core";

const props = defineProps<FightRowProps>();

interface FightRowProps {
  fightStatus: FightStatus;
  active: boolean;
  leftFighter: string;
  rightFighter: string;
  score: string | null; // Ajout afin de pouvoir laisser l'affichage du score numérique dans FightRow
}

</script>

<template>
  <tr :class="[props.active ? 'bg-base-200' : 'hover:bg-base-200']">
    <td class="p-0">
      <div :class="props.active ? 'grid grid-rows-[auto_1fr_auto] h-full' : ''">
        <div class="grid grid-cols-[auto_1fr] items-center">
          <!-- Boutons -->
          <div class="w-48 pt-1">
            <span v-if="props.active" class="gap-2">
              <slot name="left-assign" />
            </span>
          </div>
          <!-- Nom -->
          <span class="text-right font-medium justify-self-end">
            {{ props.leftFighter }}
          </span>
        </div>

        <!-- Hansoku -->
        <div class="flex justify-start gap-2 mt-4 h-8" v-if="props.active">
          <slot name="left-hansoku" />
        </div>
      </div>
    </td>

    <td class="w-40 relative p-0">
      <!-- Content -->
      <div class="relative z-10 h-full">
        <div
          v-if="props.active"
          class="flex flex-col items-center justify-center h-full py-2 gap-2"
        >
          <div class="font-semibold leading-none">
            {{ props.score ?? "VS" }}
          </div>

          <div class="grid grid-cols-[1fr_auto_1fr] items-center w-full">
            <div class="flex justify-end gap-2 mr-2">
              <slot name="left-score" />
            </div>

            <div></div>

            <div class="flex justify-start gap-2 ml-2">
              <slot name="right-score" />
            </div>
          </div>
        </div>

        <div v-else class="flex items-center justify-center h-full font-semibold">
          {{ props.score ?? "VS" }}
        </div>
      </div>
    </td>

    <td class="p-0">
      <div :class="props.active ? 'grid grid-rows-[auto_1fr_auto] h-full' : ''">
        <div class="grid grid-cols-[1fr_auto] items-center">
          <!-- Nom -->
          <span class="text-left font-medium justify-self-start">
            {{ props.rightFighter }}
          </span>
          <!-- Boutons -->
          <div class="w-48 pt-1">
            <span v-if="props.active" class="gap-2">
              <slot name="right-assign" />
            </span>
          </div>
        </div>

        <!-- Hansoku -->
        <div class="flex justify-end gap-2 mt-4 h-8" v-if="props.active">
          <slot name="right-hansoku" />
        </div>
      </div>
    </td>

    <td class="w-px whitespace-nowrap">
      <Badge :color="StatusColor[props.fightStatus]" variant="soft">
        {{ FightStatusLabel[props.fightStatus] }}
      </Badge>
    </td>

    <!-- Garder le switch en fonction du combat actif ici ou deplacer aussi cette logique vers FightList ? -->
    <td class="">
      <div v-if="!props.active" class="flex justify-center">
        <slot name="actions-inactive" />
      </div>

      <div v-else class="flex flex-col gap-3 items-center justify-center">
        <slot name="actions-active" />
      </div>
    </td>
  </tr>
</template>

<style scoped>
.table td {
  border-color: #33333340;
}
</style>
