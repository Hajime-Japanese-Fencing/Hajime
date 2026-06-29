<script setup lang="ts">

import FightRow from "../FightRow/FightRow.vue";

interface Fight {
  id: number;
  fighter1: string;
  fighter2: string;
  score: string | null;
  status: string;
}

defineProps<{
  fights: Fight[];
  activeFightId: number | null;
}>();

const emit = defineEmits<{
  (e: "toggleFight", id: number): void;
}>();

function onToggleFight(id: number) {
  emit("toggleFight", id);
}

</script>
<template>
  <!-- Table -->
  <div class="overflow-x-auto">
    <table class="table ">
      <thead>
      <tr>
        <th class="text-right">Red</th>
        <th class="text-center">↔</th>
        <th class="text-left">White</th>
        <th class="">Status</th>
        <th class=""></th>
      </tr>
      </thead>
      <tbody>
        <FightRow
            :fight="fight"
            :active="activeFightId === fight.id"
            @toggleFight="onToggleFight"
            v-for="fight in fights" :key="fight.id"
        />
      </tbody>
    </table>
  </div>
</template>

<style scoped>

</style>