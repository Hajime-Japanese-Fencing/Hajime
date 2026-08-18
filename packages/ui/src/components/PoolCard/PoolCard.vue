<script setup lang="ts">
import { computed } from "vue";
import Modal from "../Actions/Modal/Modal.vue";
import type { PoolDetails } from "./pool-details.interface.ts";
import RankingDetails from "../RankingDetails/RankingDetails.vue";
import { getRankBadgeClass } from "../../services/badgeClass.service.ts";
import type { RankingDetail } from "../RankingDetails/ranking-detail.interface.ts";

const props = defineProps<{
  poolDetails: PoolDetails;
  rankingDetails: RankingDetail[];
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
        <div class="card-actions">
          <Modal title="Ranking Details">
            <RankingDetails :fighters="props.rankingDetails"></RankingDetails>
          </Modal>
        </div>
      </div>

      <table class="table table-zebra">
        <tbody>
          <tr v-for="fighter in sortedFighters" :key="fighter.number">
            <td>{{ props.poolDetails.poolId }}.{{ fighter.number }}</td>
            <td>{{ fighter.fighterName }}</td>
            <td class="text-right">
              <span class="badge" :class="getRankBadgeClass(fighter.poolRank)">
                #{{ fighter.poolRank }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
span.badge {
  border-color: dimgray;
  background-color: dimgray;
  color: white;
  &.first {
    border-color: goldenrod;
    background-color: goldenrod;
    color: black;
  }
  &.second {
    border-color: silver;
    background-color: silver;
    color: black;
  }
  &.third {
    border-color: #8f6642;
    background-color: #8f6642;
    color: white;
  }
}
</style>
