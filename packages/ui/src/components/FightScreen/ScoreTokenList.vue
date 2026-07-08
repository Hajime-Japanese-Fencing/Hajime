<script setup lang="ts">
import type { ScoreEvent } from "./FightScreen.vue";
import ScoreToken from "./ScoreToken.vue";

type ScoreTokenData = Pick<ScoreEvent, "id" | "code" | "variant">;

const props = defineProps<{
  tokens: ScoreTokenData[];
  removable?: boolean;
}>();

const emit = defineEmits<{
  remove: [id: number];
}>();
</script>

<template>
  <div class="flex gap-2">
    <ScoreToken
      v-for="token in props.tokens"
      :key="token.id"
      :variant="token.variant"
      :removable="props.removable"
      @remove="emit('remove', token.id)"
    >
      {{ token.code }}
    </ScoreToken>
  </div>
</template>

<style scoped></style>
