<script setup lang="ts">
import Button from "../Actions/Button/Button.vue";
import { ArrowLeft } from "lucide-vue-next";
import type { ButtonProps } from "../Actions/Button/button-props.type.ts";

withDefaults(defineProps<Pick<ButtonProps, "size" | "disabled">>(), {
  size: "sm",
  disabled: false,
});

defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <Button color="neutral" variant="ghost" v-bind="$props" @click="$emit('click', $event)">
    <ArrowLeft :size="16" />
    <slot>Back</slot>
  </Button>
</template>
