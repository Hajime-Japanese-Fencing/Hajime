<script setup lang="ts">
  import Button from "./Button.vue";
  import type {ButtonProps} from "./button-props.type.ts";


  type SecondaryButtonProps = Omit<ButtonProps, "variant">;

  const props = withDefaults(defineProps<SecondaryButtonProps>(), {
    size: "md",
    disabled: false,
  });

  defineEmits<{
    click: [event: MouseEvent];
  }>();
</script>

<template>
  <Button
      v-bind="props"
      variant="secondary"
      @click="$emit('click', $event)"
  >
    <slot />
  </Button>
</template>

<style scoped>

</style>