<script setup lang="ts">
import Button from "../Actions/Button/Button.vue";
import { X } from "lucide-vue-next";
import type { ButtonProps } from "../Actions/Button/button-props.type.ts";

withDefaults(defineProps<Pick<ButtonProps, "size" | "disabled">>(), {
  size: "xs",
  disabled: false,
});

defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <Button
    color="error"
    variant="soft"
    shape="circle"
    v-bind="$props"
    @click="$emit('click', $event)"
  >
    <X :size="12" />
  </Button>
</template>
