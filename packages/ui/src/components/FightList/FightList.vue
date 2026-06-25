<script setup lang="ts">
interface Fight {
  id: number;
  fighter1: string;
  fighter2: string;
  score: string | null;
  status: string;
}

interface Props {
  fights: Fight[];
}

defineProps<Props>();
</script>

<template>
  <!-- Table -->
  <div class="overflow-x-auto">
    <table class="table table-zebra">
      <thead>
      <tr>
        <th>Red</th>
        <th>↔</th>
        <th>White</th>
        <th>Status</th>
        <th></th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="fight in fights" :key="fight.id" class="hover:bg-base-300">
        <td>{{ fight.fighter1 }}</td>
        <td>{{ fight.score ? fight.score : "VS" }}</td>
        <td>{{ fight.fighter2  }}</td>
        <td>{{ fight.status }}</td>
        <td>
          <button class="btn btn-ghost btn-xs">📂</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>

</style>