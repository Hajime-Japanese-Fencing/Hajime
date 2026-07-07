<script setup lang="ts">

import {computed} from "vue";

const props = withDefaults(
    defineProps<{
      removable?: boolean
      variant?: "filled" | "outline"
    }>(),
    {
      removable: false,
      variant: "filled",
    }
);

const tokenClass = computed(() =>
    props.variant === "filled"
        ? "bg-base text-base-content border-transparent"
        : "bg-base text-base-content border-base-content"
);

const emit = defineEmits<{
  remove: [];
}>();

function onRemove() {
  emit("remove");
}

</script>

<template>
  <div class="relative group">
  <span class="inline-flex h-8 w-8 items-center justify-center rounded-full font-semibold border"
        :class="tokenClass">
    <slot />
  </span>

    <button v-if="props.removable" @click.stop="onRemove"
        class="absolute -bottom-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity
           h-4 w-4 items-center justify-center
           rounded-full bg-warning text-warning-content"
    >
      x
    </button>
  </div>
</template>

<style scoped>

</style>