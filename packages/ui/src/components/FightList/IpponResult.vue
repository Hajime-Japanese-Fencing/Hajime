<script setup lang="ts">
import { computed } from "vue";
import DestructiveButton from "../Overlay/DestructiveButton.vue";

const props = withDefaults(
  defineProps<{
    removable?: boolean;
    firstBlood?: boolean;
  }>(),
  {
    removable: false,
    firstBlood: false,
  },
);

const emit = defineEmits<{
  remove: [];
}>();

const resultClass = computed(() =>
  props.firstBlood
    ? "bg-base text-base-content border-base-content"
    : "bg-base text-base-content border-transparent",
);

function onRemove() {
  emit("remove");
}
</script>

<template>
  <div class="indicator group">
    <DestructiveButton
      v-if="props.removable"
      class="indicator-item indicator-top indicator-end opacity-0 group-hover:opacity-100 transition-opacity"
      aria-label="Remove"
      @click.stop="onRemove"
    />

    <span
      class="inline-flex h-8 w-8 items-center justify-center rounded-full font-semibold border"
      :class="resultClass"
    >
      <slot />
    </span>
  </div>
</template>

<style scoped></style>
