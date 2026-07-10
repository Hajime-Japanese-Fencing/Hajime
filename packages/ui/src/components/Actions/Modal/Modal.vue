<script setup lang="ts" generic="T">
import Button from "../Button/Button.vue";
import { Ellipsis, X } from "lucide-vue-next";
import GhostButton from "../Button/GhostButton.vue";

defineProps<{ title: string }>();
</script>

<template>
  <GhostButton onclick="modal1.showModal();" class="w-max px-1"><Ellipsis></Ellipsis></GhostButton>

  <dialog id="modal1" class="modal">
    <div class="modal-box bg-black text-neutral-300 p-10 min-w-max">
      <form method="dialog" class="flex justify-end">
        <button class="bg-none"><X /></button>
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
