<script setup lang="ts">
import type { ScoreEvent, ScoreEventId } from "@hajime/core";
import { IpponCode } from "@hajime/core";
import { computed } from "vue";
import DestructiveButton from "../Overlay/DestructiveButton.vue";

const props = defineProps<{
  event: ScoreEvent;
  removable: boolean;
}>();

const emit = defineEmits<{
  remove: [id: ScoreEventId];
}>();

const resultClass = computed(() =>
  props.event.firstBlood
    ? "bg-base text-base-content border-base-content"
    : "bg-base text-base-content border-transparent",
);

// --- AN IPPON AUTO-AWARDED FROM A FIGHTER'S 2ND/4TH/... HANSOKU (TAGGED WITH IpponCode.Ippon
// RATHER THAN A NAMED STRIKE) SHOULDN'T BE REMOVABLE DIRECTLY — IT ONLY GOES AWAY WHEN THE
// HANSOKU THAT CAUSED IT IS ITSELF REMOVED. SEE removeScoreEvent IN score-event-rules.ts. ---
const isAutoAwardedIppon = computed(
  () => props.event.type === "ippon" && props.event.code === IpponCode.Ippon,
);

function onRemove() {
  emit("remove", props.event.id);
}
</script>

<template>
  <div class="indicator group">
    <div
      class="indicator-item indicator-top indicator-end opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <DestructiveButton
        v-if="props.removable && !isAutoAwardedIppon"
        aria-label="Remove"
        @click.stop="onRemove"
      />
    </div>
    <span
      class="inline-flex h-8 w-8 items-center justify-center rounded-full font-semibold border"
      :class="resultClass"
    >
      {{ props.event.code }}
    </span>
  </div>
</template>

<style scoped></style>
