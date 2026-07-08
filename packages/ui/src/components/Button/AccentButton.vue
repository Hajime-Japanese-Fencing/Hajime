<script setup lang="ts">
import Button from "./Button.vue";
import type { ButtonProps } from "./button-props.type.ts";

type AccentButtonProps = Omit<ButtonProps, "variant">;

const props = withDefaults(defineProps<AccentButtonProps>(), {
  size: "md",
  disabled: false,
});

defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <Button v-bind="props" variant="accent" @click="$emit('click', $event)">
    <slot />
  </Button>
</template>

<style scoped></style>
