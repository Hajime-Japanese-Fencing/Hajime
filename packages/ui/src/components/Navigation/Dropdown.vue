<script setup lang="ts">
import type { DropdownOption } from "./dropdown-option.interface.ts";

defineProps<{
  title: string;
  options: DropdownOption[];
}>();

const emit = defineEmits<{
  select: [select: DropdownOption];
}>();
</script>

<template>
  <button class="btn" popovertarget="popover-1" style="anchor-name: --anchor-1">
    {{ title }}
  </button>
  <ul
    class="dropdown menu w-52 rounded-box bg-base-100 shadow-sm"
    popover
    id="popover-1"
    style="position-anchor: --anchor-1"
  >
    <li v-for="option in options" :key="option.label">
      <button
        type="button"
        popovertarget="popover-1"
        popovertargetaction="hide"
        @click="emit('select', option)"
      >
        {{ option.label }}
      </button>
    </li>
  </ul>
</template>

<style scoped></style>
