<script setup lang="ts">
import { computed } from "vue";
import type { PoolDetails } from "../PoolCard/pool-details.interface.ts";

const props = defineProps<{
  poolDetails: PoolDetails;
}>();

const sortedFighters = computed(() => {
  if (!props.poolDetails) throw new Error("No pool data");
  return [...props.poolDetails.fighters].sort((a, b) => a.number - b.number);
});
</script>

<template>
  <div class="card">
    <div class="card-body">
      <!--HEADLINE-->
      <div class="flex justify-between">
        <h2 class="card-title">Pool n°{{ props.poolDetails.poolId }}</h2>
      </div>

      <table class="table table-zebra">
        <tbody>
          <tr v-for="fighter in sortedFighters" :key="fighter.number">
            <td>{{ props.poolDetails.poolId }}.{{ fighter.number }}</td>
            <td>{{ fighter.fighterName }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped></style>
