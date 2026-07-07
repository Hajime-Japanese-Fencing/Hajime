<script setup lang="ts">
import Button from "./Button.vue";
import type { ButtonProps } from "./button-props.type.ts";

type RoundButtonProps = Omit<ButtonProps, "shape">;

const props = withDefaults(defineProps<RoundButtonProps>(), {
  variant: "primary",
  size: "md",
  disabled: false,
});

defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <Button v-bind="props" shape="circle" @click="$emit('click', $event)">
    <slot />
  </Button>
</template>

<style scoped></style>
