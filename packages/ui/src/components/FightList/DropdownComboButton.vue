<script setup lang="ts">
import { BiSolidDownArrow } from "vue-icons-plus/bi";
import { TiTick, TiCancel, TiFlag } from "vue-icons-plus/ti";
import Badge from "./Badge.vue";

type Action = "cancel" | "forfeit";

const props = defineProps<{
  id: number;
}>();

const emit = defineEmits<{
  (e: "action", id: number, action: Action | "validate"): void;
}>();

const popoverId = `action-menu-${props.id}`;

function validate() {
  emit("action", props.id, "validate");
}

function cancel() {
  emit("action", props.id, "cancel");
}

function forfeit() {
  emit("action", props.id, "forfeit");
}
</script>

<template>
  <div class="join">
    <button class="btn btn-outline btn-sm join-item btn-success" @click="validate">
      <TiTick />
      Validate
    </button>
    <button
        class="btn btn-outline btn-sm join-item btn-success"
        :popovertarget="popoverId"
        :style="{ anchorName: `--${popoverId}` }"
    >
      <BiSolidDownArrow size="16" />
    </button>
  </div>

  <ul
      class="dropdown dropdown-end menu rounded-box bg-base-100 shadow-sm"
      popover
      :id="popoverId"
      :style="{ positionAnchor: `--${popoverId}` }"
  >
    <li class="items-center"><a @click="cancel">
      <Badge color="error">
        <TiCancel />
        Cancel
      </Badge>
    </a></li>
    <li class="items-center"><a @click="forfeit">
      <Badge color="warning">
        <TiFlag />
        Forfeit
      </Badge>
    </a></li>
  </ul>
</template>

<style scoped>

</style>