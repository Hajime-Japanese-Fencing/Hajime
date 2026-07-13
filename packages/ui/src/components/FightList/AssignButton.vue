<script setup lang="ts">
import Button from "../Actions/Button/Button.vue";
import type { ButtonProps } from "../Actions/Button/button-props.type.ts";

const props = withDefaults(
  defineProps<{
    tooltip: string;
    size?: ButtonProps["size"]; // utile si on veut rendre le bouton pour assigner un Hansoku plus petit?
  }>(),
  {
    size: "sm",
  },
);

const emit = defineEmits<{
  assign: [];
}>();
</script>

<template>
  <label class="tooltip" :data-tip="props.tooltip">
    <Button
      color="neutral"
      variant="outline"
      :size="props.size"
      shape="circle"
      @click="emit('assign')"
    >
      <slot />
    </Button>
  </label>
</template>

<style scoped></style>
