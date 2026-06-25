<script setup lang="ts">
  import Button from "./Button.vue";
  import {ref} from "vue";

  const fighters = defineModel()
  const isOpen = ref(true)


</script>

<template>
  <div class="bg-black text-neutral-300 p-10 w-max" v-show="isOpen">

    <div class="flex justify-end">
      <Button variant="ghost" size="xs" @click="isOpen=false">X</Button>
    </div>

    <h2 class="card-title mb-2">Ranking details</h2>

    <div id="content" class="mb-5">
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
          <tr v-for="fighter in fighters">
            <td>{{ fighter.number }}</td>
            <td>{{ fighter.fighterName }}</td>
            <td>{{ fighter.points }}</td>
            <td>{{ fighter.nbVictories }}</td>
            <td>{{ fighter.nbGivenIppons }}</td>
            <td>{{ fighter.nbReceivedIppons }}</td>
          </tr>
        </tbody>
      </table>

    </div>
    <div class="flex justify-end">
      <Button variant="primary" @click="isOpen=false">Close</Button>
    </div>


  </div>
</template>

<style scoped>

  tbody > tr:nth-child(odd) > td {
    background-color: #0a0a0a;
    border-top:1px solid #323232;
    border-bottom:1px solid #323232;
  }
</style>