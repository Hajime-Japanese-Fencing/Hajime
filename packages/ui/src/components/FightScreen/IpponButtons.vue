<script setup lang="ts">
import type {ScoreEvent} from "./FightRow.vue";

interface IpponType {
  code: ScoreEvent["code"]
  label: string;
}

const ippons: IpponType[] = [
  { code: "M", label: "Men" },
  { code: "D", label: "Do" },
  { code: "K", label: "Kote" },
  { code: "T", label: "Tsuki" },
  { code: "Ht", label: "Hantei" },
  { code: "Δ", label: "Hansoku" },
];

defineProps<{
  textColor: string;
}>();

const emit = defineEmits<{
  (e: "addIppon", code: ScoreEvent["code"]): void;
}>();
</script>

<template>
  <div class="flex justify-center gap-1">
    <button
      v-for="ippon in ippons"
      :key="ippon.code"
      class="btn btn-xs btn-outline btn-circle tooltip"
      :class="textColor"
      :data-tip="ippon.label"
      @click="emit('addIppon', ippon.code)"
    >
      {{ ippon.code }}
    </button>
  </div>
</template>

<style scoped></style>
