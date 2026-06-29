<script setup lang="ts">

import FightScreen from "../IpponScreen/FightScreen.vue";

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
  <tr :class="[active ? 'bg-base-200 border-x border-t border-base-300' : '']">
    <td class="text-right">
      <p>
        {{ fight.fighter1 }}
      </p>
    </td>
    <td class="text-center">
      {{ fight.score ? fight.score : "VS" }}
    </td>
    <td class="text-left">
      <p>
        {{ fight.fighter2 }}
      </p>
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
  <tr v-if="active"  class="bg-base-200 border-x border-b border-base-300 rounded-b-xl">
    <FightScreen :fight="fight"/>
  </tr>
</template>

<style scoped>

</style>