<script setup lang="ts">
import IpponResult from "./IpponResult.vue";
import type { IpponCode } from "@hajime/core";

const props = defineProps<{
  ippons: IpponCode[];
  removable?: boolean;
  alignment: "start" | "end";
}>();

const emit = defineEmits<{
  remove: [id: number];
}>();

/*
 * REvoir le firstBlood pour qu'il soit seulement attribué au premier ippon du combat, pas au premier de chaque combattant
 */
</script>

<template>
  <div class="flex flex-wrap gap-1" :class="alignment === 'end' ? 'justify-end' : 'justify-start'">
    <IpponResult
      v-for="(ippon, index) in ippons"
      :firstBlood="index === 0"
      :removable="props.removable"
      @remove="emit('remove', index)"
    >
      {{ ippon }}
    </IpponResult>
  </div>
</template>

<style scoped></style>
