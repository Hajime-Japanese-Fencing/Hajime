<script setup lang="ts">
import Button from "./Button.vue";
import type { ButtonProps } from "./button-props.type.ts";

withDefaults(defineProps<Pick<ButtonProps, "size" | "disabled" | "loading" | "wide" | "block">>(), {
  size: "sm",
  disabled: false,
  loading: false,
  wide: false,
  block: false,
});

defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <Button color="error" variant="soft" v-bind="$props" @click="$emit('click', $event)">
    <slot />
  </Button>
</template>
