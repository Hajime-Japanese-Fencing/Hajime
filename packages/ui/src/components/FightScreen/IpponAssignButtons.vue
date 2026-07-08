<script setup lang="ts">
import {type ASSIGNABLE_CODE, assignableCodes} from "@hajime/core/src/ippons.ts";

const emit = defineEmits<{
  (e: "addIppon", code: ASSIGNABLE_CODE): void;
}>();
</script>

<template>
  <div class="flex justify-center gap-1">
    <button
      v-for="ippon in assignableCodes"
      :key="ippon.code"
      class="btn btn-xs btn-outline btn-circle tooltip"
      :data-tip="ippon.label"
      @click="emit('addIppon', ippon.code)"
    >
      {{ assignableCodes.code }}
    </button>
  </div>
</template>

<style scoped></style>
