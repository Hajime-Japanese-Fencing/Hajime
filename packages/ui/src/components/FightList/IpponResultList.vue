<script setup lang="ts">
import IpponResult from "./IpponResult.vue";
import type {IpponCode} from "@hajime/core";



const props = defineProps<{
  ippons: IpponCode[];
  removable?: boolean;
}>();

const emit = defineEmits<{
  remove: [id: number];
}>();

/*
 * REvoir le firstBlood pour qu'il soit seulement attribué au premier ippon du combat, pas au premier de chaque combattant
 */

</script>

<template>
  <div class="flex gap-2">
    <IpponResult
      v-for="(ippon, index) in ippons"
      :firstBlood="index === 1"
      :removable="props.removable"
      @remove="emit('remove', index)"
    >
      {{ ippon }}
    </IpponResult>
  </div>
</template>

<style scoped></style>
