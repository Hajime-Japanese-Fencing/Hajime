<script setup lang="ts" generic="T">
import Button from "../Button/Button.vue";
import CloseButton from "../Overlay/CloseButton.vue";
import { Ellipsis } from "lucide-vue-next";

defineProps<{ title: string }>();
</script>

<template>
  <Button color="neutral" variant="ghost" onclick="modal1.showModal();" class="w-max px-1">
    <Ellipsis />
  </Button>

  <dialog id="modal1" class="modal">
    <div class="modal-box bg-black text-neutral-300 p-10 min-w-max">
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
