<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "primary" | "secondary" | "accent" | "ghost" | "outline";
    size?: "xs" | "sm" | "md" | "lg";
    disabled?: boolean;
  }>(),
  {
    variant: "primary",
    size: "md",
    disabled: false,
  },
);

defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <button
    :class="['btn', `btn-${variant}`, size !== 'md' ? `btn-${size}` : '']"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
