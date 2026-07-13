<script setup lang="ts">
import { AssignableIpponCode, assignableIppons } from "@hajime/core";

import AssignButton from "./AssignButton.vue";

const emit = defineEmits<{
  assign: [code: AssignableIpponCode];
}>();
</script>

<template>
  <div class="flex justify-center gap-1">
    <AssignButton
      v-for="ippon in assignableIppons"
      :key="ippon.code"
      :tooltip="ippon.label"
      @assign="emit('assign', ippon.code)"
    >
      {{ ippon.code }}
    </AssignButton>
  </div>
</template>

<style scoped></style>
