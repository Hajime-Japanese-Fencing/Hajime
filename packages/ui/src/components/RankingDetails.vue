<script setup lang="ts">
  import type {IFighterPoints} from "./fighter-points.interface.ts";

  const fighters = defineModel<IFighterPoints[]>()

</script>

<template>
  <table class="table w-auto">
    <thead class="text-neutral-300">
      <tr>
        <td>#</td>
        <td>Name</td>
        <td>Points</td>
        <td>Victories</td>
        <td>Ippons Given</td>
        <td>Ippons Received</td>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(fighter, index) in fighters">
        <td>{{ index + 1 }}</td>
        <td>{{ fighter.fighterName }}</td>
        <td>{{ fighter.points }}</td>
        <td>{{ fighter.nbVictories }}</td>
        <td>{{ fighter.nbGivenIppons }}</td>
        <td>{{ fighter.nbReceivedIppons }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
  tbody > tr:nth-child(odd) > td {
    background-color: #0a0a0a;
    border-top:1px solid #323232;
    border-bottom:1px solid #323232;
  }
</style>