<script setup lang="ts">


import OutlineButton from "./OutlineButton.vue";
import type {ButtonProps} from "./button-props.type.ts";

const props = withDefaults(
    defineProps<{
      tooltip: string;
      disabled?:  ButtonProps["disabled"]; // Que faire des boutons d'assignation quand un combat est en lecture seule? (Finished) : boutons disabled ou pas affichés du tout ?
      size?: ButtonProps["size"]; // utile si on veut rendre le bouton pour assigner un Hansoku plus petit?
    }>(),
    {
      disabled: false,
      size: "sm",
    },
);

const emit = defineEmits<{
  assign: [];
}>();
</script>

<template>
  <label class="tooltip" :data-tip="props.tooltip">
    <OutlineButton
        :size="props.size"
        shape="circle"
        @assign="emit('assign')"
        :disabled="props.disabled"
    >
      <slot />
    </OutlineButton>
  </label>
</template>

<style scoped>

</style>