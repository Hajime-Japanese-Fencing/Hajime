<script setup lang="ts" generic="T">
import { Ellipsis } from "lucide-vue-next";
import Button from "../Button/Button.vue";
import CloseButton from "../../Overlay/CloseButton.vue";

defineProps<{ title: string }>();
</script>

<template>
  <Button color="info" variant="ghost" onclick="modal1.showModal();" class="w-max px-1">
    <Ellipsis />
  </Button>

  <dialog id="modal1" class="modal">
    <div class="modal-box p-10 min-w-max">
      <form method="dialog" class="flex justify-end">
        <CloseButton />
      </form>

      <h2 class="card-title mb-2">{{ title }}</h2>

      <div id="content" class="mb-5">
        <slot></slot>
      </div>

      <form method="dialog" class="flex justify-end">
        <Button>Close</Button>
      </form>
    </div>
  </dialog>
</template>

<style scoped></style>
