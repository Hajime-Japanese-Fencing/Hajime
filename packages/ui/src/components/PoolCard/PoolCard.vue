<script setup lang="ts">

import Modal from "../Modal/Modal.vue";
import type {PoolDetails} from "./pool-details.interface.ts";
import type {FighterPoints} from "../RankingDetails/fighter-points.interface.ts";
import RankingDetails from "../RankingDetails/RankingDetails.vue";
import {computed} from "vue";
import {getRankBadgeClass} from "../../services/badgeClass.service.ts";

const props = defineProps<{
  poolDetails: PoolDetails,
  rankingDetails: FighterPoints[]
}>()

const sortedFighters = computed(() => {
  if (!props.poolDetails) throw new Error("Aucune donnée de pool")
  return [...props.poolDetails.fighters].sort((a, b) => a.number - b.number)
})

// const poolDetails = defineModel<PoolDetails>()
//
// // A refactor dans un service/mapper ?
// const poolRankingDetails = computed<FighterPoints[]>(() => {
//   if (!poolDetails.value) throw new Error("Aucune donnée de pool")
//
//   return poolDetails.value.fighters.map(fighter => ({
//           fighterName: fighter.fighterName,
//           points: fighter.points,
//           nbVictories: fighter.nbVictories,
//           nbGivenIppons: fighter.nbGivenIppons,
//           nbReceivedIppons: fighter.nbReceivedIppons,
//           poolRank: fighter.poolRank,
//         }))
// })

</script>

<template>

  <div class="card bg-black ">
    <div class="card-body text-white">

      <!--HEADLINE-->
      <div class="flex justify-between">
        <h2 class="card-title">Pool n°{{ props.poolDetails.poolId }}</h2>
        <div class="card-actions">
          <Modal title="Ranking Details">
            <RankingDetails :fighters="props.rankingDetails"></RankingDetails>
          </Modal>
        </div>
      </div>

      <div v-for="fighter in sortedFighters" class="flex justify-between">
        <span>{{props.poolDetails.poolId}}.{{fighter.number}}</span>
        <span>{{fighter.fighterName}}</span>
        <span class="badge" :class="getRankBadgeClass(fighter.poolRank)">#{{fighter.poolRank}}</span>
      </div>


    </div>
  </div>

</template>

<style scoped>
  span.badge {
    border-color: dimgray;
    background-color: dimgray;
    &.first {
      border-color: goldenrod;
      background-color: goldenrod;
    }
    &.second {
      border-color: silver;
      background-color: silver;
    }
    &.third {
      border-color: #8f6642;
      background-color: #8f6642;
    }
  }
</style>