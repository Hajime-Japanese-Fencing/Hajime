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
  (e: "cancelFight", id: number): void;
  (e: "validateFight", id: number): void;
  (e: "forfeitFight", id: number): void;
}>();

function onToggleFight(id: number) {
  emit("toggleFight", id);
}

function onCancelFight(id: number) {
  emit("cancelFight", id);
}

function onValidateFight(id: number) {
  emit("validateFight", id);
}

function onForfeitFight(id: number) {
  emit("forfeitFight", id);
}

</script>
<template>
  <!-- Table -->
  <div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
    <table class="table">
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
            @cancelFight="onCancelFight"
            @validateFight="onValidateFight"
            @forfeitFight="onForfeitFight"
            v-for="fight in fights" :key="fight.id"
        />
      </tbody>
    </table>
  </div>
</template>

<style scoped>

</style>