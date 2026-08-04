<script setup lang="ts">
import Badge from "../DataDisplay/Badge.vue";
import { LockKeyhole } from "lucide-vue-next";
import type { CallListFighter } from "./CallListFighter.ts";

const props = defineProps<{
  fighters: CallListFighter[];
}>();
</script>

<template>
  <div class="flex flex-row justify-between">
    <div>
      Total of Fighters <Badge shape="round">{{ props.fighters.length }}</Badge>
    </div>
    <div><LockKeyhole class="inline h-4 w-4" /> Readonly</div>
  </div>

  <table class="table">
    <thead class="table-header-group">
      <tr>
        <td>Presence</td>
        <td>Name</td>
        <td>License Number</td>
        <td>Birthdate</td>
        <td>Rank</td>
        <td>Club</td>
      </tr>
    </thead>
    <tbody>
      <tr v-for="fighter in fighters">
        <td>{{ fighter.isPresent }}</td>
        <td>{{ fighter.name }}</td>
        <td>{{ fighter.licenseNumber }}</td>
        <td>{{ fighter.birthdate }}</td>
        <td>{{ fighter.rank }}</td>
        <td>{{ fighter.club }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped></style>
