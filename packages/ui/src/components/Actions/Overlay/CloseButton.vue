<script setup lang="ts">
import Button from "../Button/Button.vue";
import { X } from "lucide-vue-next";
import type { ButtonProps } from "../Button/button-props.type.ts";

withDefaults(defineProps<Pick<ButtonProps, "size" | "disabled">>(), {
  size: "sm",
  disabled: false,
});

defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <Button
    color="neutral"
    variant="ghost"
    shape="circle"
    v-bind="$props"
    @click="$emit('click', $event)"
  >
    <X :size="16" />
  </Button>
</template>
