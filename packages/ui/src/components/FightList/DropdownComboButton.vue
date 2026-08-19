<script setup lang="ts">
import { Ban, Check, ChevronDown, Flag } from "lucide-vue-next";
import Badge from "../DataDisplay/Badge.vue";
import Button from "../Actions/Button/Button.vue";
import type { Action } from "./types.ts";

const props = defineProps<{
  id: string;
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
    <Button color="success" variant="outline" size="sm" class="join-item" @click="validate">
      <Check />
      Validate
    </Button>
    <Button
      color="success"
      variant="outline"
      size="sm"
      class="join-item"
      :popovertarget="popoverId"
      :style="{ anchorName: `--${popoverId}` }"
    >
      <ChevronDown :size="16" />
    </Button>
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
