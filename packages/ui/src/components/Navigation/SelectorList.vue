<script setup lang="ts">
import Button from "../Actions/Button/Button.vue";
import type { SelectorItem } from "./selector-item.interface.ts";

withDefaults(
  defineProps<{
    items: SelectorItem[];
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    direction?: "row" | "col";
  }>(),
  {
    size: "md",
    direction: "col",
  },
);

const selectedId = defineModel<string | null>({ default: null });

defineEmits<{
  select: [id: string];
}>();

// --- FILLS THE BUTTON FROM THE LEFT ACCORDING TO ITS PROGRESS, BEHIND THE LABEL. USES A
// GRADIENT RATHER THAN A SEPARATE OVERLAY ELEMENT SO IT RIDES ALONG WITH BUTTON.VUE'S OWN
// BACKGROUND (TRANSPARENT FOR ghost/outline) WITHOUT NEEDING TO TOUCH THAT COMPONENT. ---
function progressStyle(progress: number | undefined): Record<string, string> | undefined {
  if (progress === undefined) return undefined;

  const percent = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  return {
    backgroundImage: `linear-gradient(to right, color-mix(in oklch, var(--color-success) 35%, transparent) ${percent}%, transparent ${percent}%)`,
  };
}
</script>

<template>
  <div class="flex gap-1" :class="direction == 'col' ? 'flex-col' : ''">
    <Button
      v-for="item in items"
      :key="item.id"
      :color="item.id === selectedId ? 'primary' : 'neutral'"
      :variant="item.id === selectedId ? 'outline' : 'ghost'"
      :size="size"
      :disabled="item.disabled"
      :style="progressStyle(item.progress)"
      :block="direction == 'col'"
      class="justify-start"
      @click="
        selectedId = item.id;
        $emit('select', item.id);
      "
    >
      {{ item.label }}
    </Button>
  </div>
</template>
