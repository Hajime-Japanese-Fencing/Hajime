<script setup lang="ts">

import { BiArchiveOut } from 'vue-icons-plus/bi'
import { BsEye } from 'vue-icons-plus/bs'
import IpponButtons from "./IpponButtons.vue";

interface Fight {
  id: number;
  fighter1: string;
  fighter2: string;
  score: string | null;
  status: string;
}

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

</script>

<template>
  <tr :class="[active ? 'bg-base-200 outline-2 outline-base-300' : 'hover:bg-base-200']">

    <td class="align-top">
      <div class="grid grid-rows-[auto_1fr_auto] h-full">
        <!-- Nom -->
        <div class="text-right font-medium">
          {{ fight.fighter1 }}
        </div>
        <!-- Boutons -->
        <div v-if="active" class="flex justify-end gap-2 mt-6">
          <IpponButtons @addIppon="addLeftIppon"/>
        </div>
        <div class="flex flex-col min-h-28 p-4" v-if="active">
          <!-- Ippons -->
          <div class="flex flex-1 justify-center items-center gap-3 my-8">
            <div class="btn btn-circle btn-lg btn-outline">M</div>
            <div class="btn btn-circle btn-lg btn-ghost">K</div>
          </div>
          <!-- Hansoku -->
          <div class="flex justify-end gap-2">
            <div class="btn btn-circle btn-sm btn-ghost">
              Δ
            </div>
          </div>
        </div>
      </div>
    </td>

    <td class="align-top">
      <div class="grid grid-rows-[auto_1fr_auto]">
        <div class="text-center font-semibold">
          {{ fight.score ?? "VS" }}
        </div>
        <div v-if="active"></div>
        <div v-if="active"></div>
      </div>
    </td>

    <td class="align-top">
      <div class="grid grid-rows-[auto_1fr_auto] h-full">
        <!-- Nom -->
        <div class="text-left font-medium">
          {{ fight.fighter1 }}
        </div>
        <!-- Boutons -->
        <div v-if="active" class="flex justify-start gap-2 mt-6">
          <IpponButtons @addIppon="addRightIppon"/>
        </div>
        <div class="flex flex-col min-h-28 p-4" v-if="active">
          <!-- Ippons -->
          <div class="flex flex-1 justify-center items-center gap-3 my-8">
            <div class="btn btn-circle btn-lg btn-ghost">D</div>
          </div>
          <!-- Hansoku -->
          <div class="flex justify-start gap-2">
            <div class="btn btn-circle btn-sm btn-ghost">
              Δ
            </div>
          </div>
        </div>
      </div>
    </td>

    <td class="align-top">
      {{ fight.status }}
    </td>

    <td class="align-top">
      <div v-if="!active" class="flex justify-center">
        <button class="btn btn-ghost btn-xs" @click="emit('toggleFight', fight.id)">
          <BsEye v-if="fight.status=='Finished'"/>
          <BiArchiveOut v-if="fight.status=='Waiting'"/>
        </button>
      </div>
      <div v-else class="flex flex-col gap-3 items-center justify-center ">
        <button class="btn btn-outline btn-sm w-24" @click="emit('cancelFight', fight.id)">
          Cancel
        </button>
        <button class="btn btn-primary btn-sm w-24" @click="emit('validateFight', fight.id)">
          Validate
        </button>
        <button class="btn btn-secondary btn-sm w-24" @click="emit('forfeitFight', fight.id)">
          Forfeit
        </button>
      </div>
    </td>

  </tr>
</template>

<style scoped>

</style>