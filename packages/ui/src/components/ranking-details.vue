<script setup lang="ts">
  import Button from "./Button.vue";
  import CgDetailsMore from "vue-icons-plus/sl";
  import type {IFighterPoints} from "./fighterPoints.interface.ts";

  const fighters = defineModel<IFighterPoints[]>()


</script>

<template>
  <Button variant="ghost" onclick="modal1.showModal()"><CgDetailsMore></CgDetailsMore></Button>

  <dialog id="modal1" class="modal">
    <div class="modal-box bg-black text-neutral-300 p-10 min-w-max">

      <form class="flex justify-end">
        <Button variant="ghost" size="xs">X</Button>
      </form>

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

      </div>
      <form method="dialog" class="flex justify-end">
        <Button variant="primary">Close</Button>
      </form>


    </div>
  </dialog>

</template>

<style scoped>

  tbody > tr:nth-child(odd) > td {
    background-color: #0a0a0a;
    border-top:1px solid #323232;
    border-bottom:1px solid #323232;
  }
</style>