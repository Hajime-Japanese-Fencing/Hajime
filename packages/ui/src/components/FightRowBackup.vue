<script setup lang="ts">

import FightScreen from "../IpponScreen/FightScreen.vue";
import IpponButtons from "../IpponButtons.vue";

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
}>();

</script>

<template>
  <tr :class="[active ? 'bg-base-200 outline-2 outline-base-300' : 'hover:bg-base-200']">
    <td class="text-right">
      <span>
        {{ fight.fighter1 }}
      </span>
      <section class="p-6 flex flex-col gap-8 justify-center" v-if="active">

        <IpponButtons/>

        <!-- Zone des ippons -->
        <div class="min-h-28 rounded-lg p-4">
          <div class="flex flex-wrap gap-3 justify-center">
            <div class="btn btn-circle btn-lg btn-outline">M</div>
            <div class="btn btn-circle btn-lg btn-ghost">K</div>
          </div>
        </div>

      </section>
    </td>
    <td class="text-center">
      {{ fight.score ? fight.score : "VS" }}
    </td>
    <td class="text-left">
      <div>
        {{ fight.fighter2 }}
      </div>
      <section class="p-6 flex flex-col gap-8 justify-center" v-if="active">

        <IpponButtons/>

        <!-- Zone des ippons -->
        <div class="min-h-28 rounded-lg p-4">
          <div class="flex flex-wrap gap-3 justify-center">
            <div class="btn btn-circle btn-lg btn-ghost">D</div>
          </div>
        </div>

      </section>
    </td>
    <td class="">
      {{ fight.status }}
    </td>
    <td class="">
      <button class="btn btn-ghost btn-xs" @click="emit('toggleFight', fight.id)">
        📂
      </button>
    </td>
  </tr>
</template>

<style scoped>

</style>