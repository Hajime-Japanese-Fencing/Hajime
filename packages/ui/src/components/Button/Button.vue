<script setup lang="ts">
import type { ButtonProps } from "./button-props.type.ts";

withDefaults(defineProps<ButtonProps>(), {
  variant: "primary",
  size: "md",
  disabled: false,
  shape: undefined,
});

defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <button
    :class="[
      'btn',
      `btn-${variant}`,
      size !== 'md' ? `btn-${size}` : '',
      shape ? `btn-${shape}` : '',
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
