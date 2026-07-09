<script setup lang="ts" generic="T">
import Button from "../Actions/Button/Button.vue";
import { CgDetailsMore } from "vue-icons-plus/cg";
import { EpCloseBold } from "vue-icons-plus/ep";
import GhostButton from "../Actions/Button/GhostButton.vue";

defineProps<{ title: string }>();
</script>

<template>
  <GhostButton onclick="modal1.showModal();" class="w-max px-1"
    ><CgDetailsMore></CgDetailsMore
  ></GhostButton>

  <dialog id="modal1" class="modal">
    <div class="modal-box bg-black text-neutral-300 p-10 min-w-max">
      <form method="dialog" class="flex justify-end">
        <button class="bg-none"><EpCloseBold /></button>
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
