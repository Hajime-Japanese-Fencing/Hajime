<script setup lang="ts">
  import {CgArrowsExchange} from "vue-icons-plus/cg";
  import FightRow, {type ScoreEvent} from "./FightRow.vue";
  import {computed, ref} from "vue";
  import RoundButton from "../Button/RoundButton.vue";

  type Fight = {
    id: number;
    fighter1: string;
    fighter2: string;
    score: string | null;
    status: FightStatus;
    scoreEvents: ScoreEvent[];
    editable: boolean;
  };

  export type FightStatus = "Waiting" | "In progress" | "Finished";

  type Side = {
    label: "Red" | "White"
    bgClass: string
    textClass: string
  }

  const props = defineProps<{
    fights: Fight[];
    openedFightId: number | null;
  }>();

  const emit = defineEmits<{
    openFight: [id: number];
    closeFight: [];
    cancelFight: [id: number];
    validateFight: [id: number];
    forfeitFight: [id: number];
  }>();


  function onOpenFight(id: number) {
    emit("openFight", id);
  }

  function onCloseFight() {
    emit("closeFight");
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

  const activeFightId = computed(() =>
      props.fights.find(fight => fight.status === "In progress")?.id ?? null
  );

  function isLocked(fight: Fight) {
    return (
        activeFightId.value !== null
        && activeFightId.value !== fight.id
    );
  }

  function swapColors() {
    leftSide.value = leftSide.value.label === "Red"
        ? WHITE
        : RED
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
          :active="props.openedFightId === fight.id"
          :locked="isLocked(fight)"
          @openFight="onOpenFight"
          @closeFight="onCloseFight"
          @cancelFight="onCancelFight"
          @validateFight="onValidateFight"
          @forfeitFight="onForfeitFight"
          v-for="fight in props.fights"
          :key="fight.id"
          :leftSide="leftSide"
          :rightSide="rightSide"
      />
      </tbody>
    </table>
  </div>
</template>

<style scoped>

  .table th,
  .tb-border {
    border-color: #33333340;
  }
</style>