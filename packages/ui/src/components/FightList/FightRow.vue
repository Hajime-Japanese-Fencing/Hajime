<script setup lang="ts">
import Badge from "../DataDisplay/Badge.vue";
import { StatusColor } from "./types.ts";
import { FightStatus, FightStatusLabel } from "@hajime/core";

const props = defineProps<FightRowProps>();

interface FightRowProps {
  fightStatus: FightStatus;
  open: boolean;
  leftFighter: string;
  rightFighter: string;
  score: string | null; // Ajout afin de pouvoir laisser l'affichage du score numérique dans FightRow
}
</script>

<template>
  <!-- Inactive row -->
  <tr v-if="!props.open" class="hover:bg-base-200">
    <td class="text-right font-medium align-middle">
      {{ props.leftFighter }}
    </td>

    <td class="w-40 text-center font-semibold align-middle">
      {{ props.score ?? "VS" }}
    </td>

    <td class="text-left font-medium align-middle">
      {{ props.rightFighter }}
    </td>

    <td class="w-px whitespace-nowrap align-middle">
      <Badge :color="StatusColor[props.fightStatus]" variant="soft">
        {{ FightStatusLabel[props.fightStatus] }}
      </Badge>
    </td>

    <td class="align-middle">
      <div class="flex justify-center">
        <slot name="actions-inactive" />
      </div>
    </td>
  </tr>

  <!-- Active row -->
  <tr v-else class="bg-base-200 h-full">
    <!-- Left Fighter -->
    <td class="p-2 align-top">
      <div class="grid grid-cols-[12rem_1fr] grid-rows-[auto_auto] gap-y-4 items-start">
        <!-- Assign -->
        <div>
          <slot name="left-assign" />
        </div>

        <!-- Nom -->
        <div class="text-right font-medium self-center">
          {{ props.leftFighter }}
        </div>

        <!-- Hansoku -->
        <div class="flex gap-2 min-h-8">
          <slot name="left-hansoku" />
        </div>

        <!-- vide -->
        <div />
      </div>
    </td>

    <!-- Score -->
    <td class="w-48 p-2 align-top">
      <div class="grid grid-rows-[auto_auto] gap-y-4">
        <!-- Score -->
        <div class="text-center font-semibold">
          {{ props.score ?? "VS" }}
        </div>

        <!-- Ippons -->
        <div class="grid grid-cols-[1fr_auto_1fr] items-start">
          <div class="flex justify-end gap-1 pr-2 min-h-8">
            <slot name="left-score" />
          </div>

          <div class="w-4"></div>

          <div class="flex justify-start gap-1 pl-2 min-h-8">
            <slot name="right-score" />
          </div>
        </div>
      </div>
    </td>

    <!-- Right Fighter -->
    <td class="p-2 align-top">
      <div class="grid grid-cols-[1fr_12rem] grid-rows-[auto_auto] gap-y-4 items-start">
        <!-- Nom -->
        <div class="text-left font-medium self-center">
          {{ props.rightFighter }}
        </div>

        <!-- Assign -->
        <div>
          <slot name="right-assign" />
        </div>

        <!-- vide -->
        <div />

        <!-- Hansoku -->
        <div class="flex justify-end gap-2 min-h-8">
          <slot name="right-hansoku" />
        </div>
      </div>
    </td>

    <td class="align-top whitespace-nowrap">
      <Badge :color="StatusColor[props.fightStatus]" variant="soft">
        {{ FightStatusLabel[props.fightStatus] }}
      </Badge>
    </td>

    <td class="align-top">
      <div class="flex flex-col items-center gap-3">
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
