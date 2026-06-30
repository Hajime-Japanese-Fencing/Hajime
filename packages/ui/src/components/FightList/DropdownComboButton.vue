<script setup lang="ts">
import { ref, computed } from "vue";
import { BiSolidDownArrow } from "vue-icons-plus/bi";

const props = defineProps<{
  id: number;
}>();

const emit = defineEmits<{
  (e: "action", id: number, action: Action): void;
}>();

type Action = "validate" | "cancel" | "forfeit";

const actions: Record<Action, { label: string }> = {
  validate: { label: "Validate" },
  cancel: { label: "Cancel" },
  forfeit: { label: "Forfeit" },
};

const selectedAction = ref<Action>("validate");

const buttonLabel = computed(() => actions[selectedAction.value].label);

function executeAction() {
  emit("action", props.id, selectedAction.value);
}

const popoverId = `action-menu-${props.id}`;
</script>

<template>
  <div class="join">
    <button class="btn btn-outline btn-sm join-item" @click="executeAction">
      {{ buttonLabel }}
    </button>

    <button class="btn btn-outline btn-sm join-item" :popovertarget="popoverId"
            :style="{ anchorName: `--${popoverId}` }">
      <BiSolidDownArrow size="16"/>
    </button>
  </div>

  <ul class="dropdown dropdown-end menu rounded-box bg-base-100 shadow-sm w-52"
          popover :id="popoverId" :style="{ positionAnchor: `--${popoverId}` }">
    <li v-for="(action, key) in actions" :key="key">
      <a @click="selectedAction = key">
        {{ action.label }}
        <span v-if="selectedAction === key">✓</span>
      </a>
    </li>
  </ul>
</template>

<style scoped>

</style>