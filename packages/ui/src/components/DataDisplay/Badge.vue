<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    color?:
      | "primary"
      | "secondary"
      | "accent"
      | "neutral"
      | "success"
      | "info"
      | "warning"
      | "error";
    variant?: "outline" | "soft" | "dash";
    shape?: "squircle" | "round";
    size?: "xs" | "sm" | "md" | "lg";
  }>(),
  {
    color: "primary",
    size: "md",
    shape: "squircle",
  },
);

const classes = computed(() => [
  "badge",
  `badge-${props.color}`,
  props.size !== "md" && `badge-${props.size}`,
  props.variant && `badge-${props.variant}`,
  props.shape,
]);
</script>

<template>
  <span :class="classes">
    <slot />
  </span>
</template>

<style scoped>
.round {
  border-radius: 50px;
}
</style>
