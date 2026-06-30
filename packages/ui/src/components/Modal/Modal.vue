<script setup lang="ts">
import Button from "../Button.vue";
import {CgDetailsMore} from "vue-icons-plus/cg";
import {EpCloseBold} from "vue-icons-plus/ep";
import RankingDetails from "../RankingDetails/RankingDetails.vue";
import type {ModalContent} from "./modal-content.interface.ts";

const modalContent = defineModel<ModalContent>()

</script>

<template>
  <Button variant="ghost" onclick="modal1.showModal()" class="w-max px-1"><CgDetailsMore></CgDetailsMore></Button>

  <dialog id="modal1" class="modal">
    <div class="modal-box bg-black text-neutral-300 p-10 min-w-max">

      <form class="flex justify-end">
        <button class="bg-none"><EpCloseBold /></button>
      </form>

      <h2 class="card-title mb-2">{{ modalContent.name }}</h2>

      <div id="content" class="mb-5">
        <ranking-details v-model="modalContent.content"></ranking-details>
      </div>

      <form method="dialog" class="flex justify-end">
        <Button variant="primary">Close</Button>
      </form>


    </div>
  </dialog>

</template>

<style scoped>

</style>