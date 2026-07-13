<script setup lang="ts">
import { AssignableIpponCode, assignableIppons } from "@hajime/core";

import AssignButton from "./AssignButton.vue";
import type { ButtonProps } from "../Actions/Button/button-props.type.ts";

const props = withDefaults(
  defineProps<{
    disabled?: ButtonProps["disabled"];
  }>(),
  {
    disabled: false,
  },
);

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
      :disabled="props.disabled"
      @assign="emit('assign', ippon.code)"
    >
      {{ ippon.code }}
    </AssignButton>
  </div>
</template>

<style scoped></style>
