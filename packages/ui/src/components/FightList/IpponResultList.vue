<script setup lang="ts">
import IpponResult from "./IpponResult.vue";
import type { ScoreEvent, ScoreEventId } from "@hajime/core";

const props = defineProps<{
  events: ScoreEvent[];
  removable?: boolean;
  alignment: "start" | "end";
}>();

const emit = defineEmits<{
  remove: [id: ScoreEventId];
}>();
</script>

<template>
  <div class="flex flex-wrap gap-1" :class="alignment === 'end' ? 'justify-end' : 'justify-start'">
    <IpponResult
      v-for="event in events"
      :key="event.id"
      :event="event"
      :removable="props.removable"
      @remove="emit('remove', $event)"
    />
  </div>
</template>

<style scoped></style>
