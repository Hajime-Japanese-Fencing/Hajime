<script setup lang="ts">
  import {computed} from "vue";

  const props = withDefaults(
      defineProps<{
        color?: "primary" | "secondary" | "accent" | "neutral" | "success" | "info" | "warning" | "error";
        variant?: "outline" | "soft" | "dash";
        size?: "xs" | "sm" | "md" | "lg";
      }>(),
      {
        color: "primary",
        size: "md"
      },
  );

  const classes = computed(() => [
    "badge",
    `badge-${props.color}`,
    props.size !== "md" && `badge-${props.size}`,
    props.variant && `badge-${props.variant}`,
  ]);
</script>

<template>
  <span :class="classes">
    <slot />
  </span>
</template>

<style scoped>

</style>