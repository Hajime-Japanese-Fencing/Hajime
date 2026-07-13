<script setup lang="ts">
import Button from "./Button.vue";
import type { ButtonProps } from "./button-props.type.ts";

type IconButtonProps = Omit<ButtonProps, "shape" | "block" | "wide"> & {
  tooltip?: string;
};

withDefaults(defineProps<IconButtonProps>(), {
  color: "neutral",
  variant: "soft",
  size: "sm",
  tooltip: undefined,
  disabled: false,
  loading: false,
});

defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <label :class="tooltip ? 'tooltip' : undefined" :data-tip="tooltip">
    <Button shape="circle" v-bind="$props" @click="$emit('click', $event)">
      <slot />
    </Button>
  </label>
</template>
