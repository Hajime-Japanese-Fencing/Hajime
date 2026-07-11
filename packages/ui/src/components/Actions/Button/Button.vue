<script setup lang="ts">
import type { ButtonProps } from "./button-props.type.ts";

withDefaults(defineProps<ButtonProps>(), {
  color: "neutral",
  variant: "soft",
  size: "md",
  shape: undefined,
  block: false,
  wide: false,
  disabled: false,
  loading: false,
});

defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <button
    :class="[
      'btn',
      color ? `btn-${color}` : '',
      variant ? `btn-${variant}` : '',
      size && size !== 'md' ? `btn-${size}` : '',
      shape ? `btn-${shape}` : '',
      block ? 'btn-block' : '',
      wide ? 'btn-wide' : '',
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="loading loading-spinner loading-sm" />
    <slot />
  </button>
</template>
