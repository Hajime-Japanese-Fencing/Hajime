<script setup lang="ts">
import Button from "./Button.vue";
import type { ButtonProps } from "./button-props.type.ts";

type OutlineButtonProps = Omit<ButtonProps, "variant">;

const props = withDefaults(defineProps<OutlineButtonProps>(), {
  size: "md",
  disabled: false,
});

defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <Button v-bind="props" variant="outline" @click="$emit('click', $event)">
    <slot />
  </Button>
</template>

<style scoped></style>
