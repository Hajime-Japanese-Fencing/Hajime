<script setup lang="ts">
import { Ban, Check, ChevronDown, Flag } from "lucide-vue-next";
import Badge from "../DataDisplay/Badge.vue";
import type { Action } from "./types.ts";

const props = defineProps<{
  id: number;
}>();

const emit = defineEmits<{
  action: [action: Action];
}>();

const popoverId = `action-menu-${props.id}`;

function validate() {
  emit("action", "validate");
}

function cancel() {
  emit("action", "cancel");
}

function forfeit() {
  emit("action", "forfeit");
}
</script>

<template>
  <div class="join">
    <button class="btn btn-outline btn-sm join-item btn-success" @click="validate">
      <Check />
      Validate
    </button>
    <button
      class="btn btn-outline btn-sm join-item btn-success"
      :popovertarget="popoverId"
      :style="{ anchorName: `--${popoverId}` }"
    >
      <ChevronDown :size="16" />
    </button>
  </div>

  <ul
    class="dropdown dropdown-end menu rounded-box bg-base-100 shadow-sm"
    popover
    :id="popoverId"
    :style="{ positionAnchor: `--${popoverId}` }"
  >
    <li class="items-center">
      <a @click="cancel">
        <Badge color="error">
          <Ban />
          Cancel
        </Badge>
      </a>
    </li>
    <li class="items-center">
      <a @click="forfeit">
        <Badge color="warning">
          <Flag />
          Forfeit
        </Badge>
      </a>
    </li>
  </ul>
</template>

<style scoped></style>
