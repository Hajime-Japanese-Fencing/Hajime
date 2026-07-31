<script setup lang="ts">
import Button from "../Actions/Button/Button.vue";
import type { SelectorItem } from "./selector-item.interface.ts";

withDefaults(
  defineProps<{
    items: SelectorItem[];
    size?: "xs" | "sm" | "md" | "lg" | "xl";
  }>(),
  {
    size: "md",
  },
);

const selectedId = defineModel<string | null>({ default: null });

defineEmits<{
  select: [id: string];
}>();
</script>

<template>
  <div class="flex flex-col gap-1">
    <Button
      v-for="item in items"
      :key="item.id"
      :color="item.id === selectedId ? 'primary' : 'neutral'"
      :variant="item.id === selectedId ? 'soft' : 'ghost'"
      :size="size"
      :disabled="item.disabled"
      block
      @click="
        selectedId = item.id;
        $emit('select', item.id);
      "
    >
      {{ item.label }}
    </Button>
  </div>
</template>
