<script setup lang="ts">
import IpponResult from "./IpponResult.vue";
import type {IpponResultData} from "./types.ts";



const props = defineProps<{
  tokens: IpponResultData[];
  removable?: boolean;
}>();

const emit = defineEmits<{
  remove: [id: number];
}>();
</script>

<template>
  <div class="flex gap-2">
    <IpponResult
      v-for="token in props.tokens"
      :key="token.id"
      :firstBlood="token.firstBlood"
      :removable="props.removable"
      @remove="emit('remove', token.id)"
    >
      {{ token.code }}
    </IpponResult>
  </div>
</template>

<style scoped></style>
