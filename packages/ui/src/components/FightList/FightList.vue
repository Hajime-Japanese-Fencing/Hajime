<script setup lang="ts">
  import {CgArrowsExchange} from "vue-icons-plus/cg";
  import FightRow from "./FightRow.vue";
  import {computed, ref} from "vue";
  import RoundButton from "../Button/RoundButton.vue";

  const fights = ref([
    {
      id: 1,
      fighter1: "Tanaka",
      fighter2: "Suzuki",
      score: null,
      status: "Waiting",
    },
    {
      id: 2,
      fighter1: "Yamamoto",
      fighter2: "Sato",
      score: "2 - 1",
      status: "Finished",
    },
    {
      id: 3,
      fighter1: "Ito",
      fighter2: "Kobayashi",
      score: null,
      status: "Waiting",
    },
  ]);

  const activeFightId = ref<number | null>(null);

  function onToggleFight(id: number) {
    if (activeFightId.value === id) {
      activeFightId.value = null;
    } else {
      const fight = fights.value.find(f => f.id === id);

      if (!fight) {
        return;
      }

      activeFightId.value = id;
    }
  }

  function onCancelFight(id: number) {
    const fight = fights.value.find(f => f.id === id);

    if (!fight) {
      return;
    }

    setFightStatus(id, "Waiting");
    activeFightId.value = null;
  }

  function onValidateFight(id: number) {
    const fight = fights.value.find(f => f.id === id);

    if (!fight) {
      return;
    }

    setFightStatus(id, "Finished");
    activeFightId.value = null;
  }

  function onForfeitFight() {}

  type FightStatus = "Waiting" | "In progress" | "Finished";

  function setFightStatus(id: number, status: FightStatus) {
    const fight = fights.value.find(f => f.id === id);

    if (!fight || fight.status === "Finished") return;

    // TODO: remplacer par l'appel API lorsque le backend sera prêt
    fight.status = status;
  }

  type Side = {
    label: "Red" | "White"
    bgClass: string
    textClass: string
  }

  const RED: Side = {
    label: "Red",
    bgClass: "bg-error",
    textClass: "text-error-content",
  }

  const WHITE: Side = {
    label: "White",
    bgClass: "bg-base-100",
    textClass: "text-base-content"
  }

  const leftSide = ref<Side>(RED)

  const rightSide = computed(() =>
      leftSide.value.label === "Red" ? WHITE : RED
  )

  function swapColors() {
    leftSide.value = leftSide.value.label === "Red"
        ? WHITE
        : RED
  }
</script>

<template>
  <div class="overflow-x-auto rounded-box border bg-base-200 tb-border">
    <table class="table">
      <thead>
      <tr>
        <th class="text-right p-0"  :class="[leftSide.bgClass, leftSide.textClass]">
          <div>
            {{ leftSide.label }}
          </div>
        </th>
        <th class="text-center w-40 relative p-0">
          <div class="grid grid-cols-2 absolute inset-0">
            <div :class="leftSide.bgClass"></div>
            <div :class="rightSide.bgClass"></div>
          </div>

          <div class="relative z-10 flex items-center justify-center h-12">
            <RoundButton @click="swapColors" variant="outline" size="sm" class="bg-neutral text-neutral-content">
              <CgArrowsExchange />
            </RoundButton>
          </div>
        </th>
        <th class="text-left p-0" :class="[rightSide.bgClass, rightSide.textClass]">
          <div>
            {{ rightSide.label }}
          </div>
        </th>
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
          :leftSide="leftSide"
          :rightSide="rightSide"
      />
      </tbody>
    </table>
  </div>
</template>

<style scoped>

</style>