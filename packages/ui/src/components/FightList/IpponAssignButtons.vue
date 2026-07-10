<script setup lang="ts">
import { type AssignableIpponCode, assignableCodes } from "@hajime/core";
import OutlineButton from "../Actions/Button/OutlineButton.vue";

const emit = defineEmits<{
  (e: "click", code: AssignableIpponCode): void;
}>();
</script>

<template>
  <div class="flex justify-center gap-1">
    <OutlineButton
      v-for="ippon in assignableCodes"
      :key="ippon.code"
      size="xs"
      shape="circle"
      class="tooltip"
      :data-tip="ippon.label"
      @click="emit('click', ippon.code)"
    >
      {{ ippon.code }}
    </OutlineButton>
  </div>
</template>

<style scoped></style>
