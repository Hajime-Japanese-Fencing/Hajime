<script setup lang="ts">
import { ref } from "vue";
import Button from "../Actions/Button/Button.vue";
import CloseButton from "../Overlay/CloseButton.vue";
import type { NewCompetitionPayload } from "./new-competition-payload.interface.ts";

const emit = defineEmits<{
  create: [payload: NewCompetitionPayload];
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);
const name = ref("");
const place = ref("");
const date = ref("");

function openModal(): void {
  dialogRef.value?.showModal();
}

function closeModal(): void {
  dialogRef.value?.close();
}

function onSubmit(): void {
  emit("create", { name: name.value, place: place.value, date: date.value });
  closeModal();
}

// --- RESETS THE FORM WHENEVER THE DIALOG CLOSES, NO MATTER HOW (SUBMIT, THE TOP-RIGHT
// CloseButton, "Annuler", OR THE ESC KEY) — THE NATIVE <dialog> "close" EVENT FIRES IN ALL OF
// THOSE CASES, SO THIS IS THE ONE PLACE THAT NEEDS TO HANDLE IT. ---
function resetForm(): void {
  name.value = "";
  place.value = "";
  date.value = "";
}
</script>

<template>
  <Button color="primary" @click="openModal">+ Nouvelle compétition</Button>

  <dialog ref="dialogRef" class="modal" @close="resetForm">
    <div class="modal-box">
      <form method="dialog" class="flex justify-end">
        <CloseButton />
      </form>

      <h2 class="card-title mb-4">Nouvelle compétition</h2>

      <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Nom</legend>
          <input
            v-model.trim="name"
            type="text"
            required
            class="input w-full"
            placeholder="Nom de la compétition"
          />
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Lieu</legend>
          <input
            v-model.trim="place"
            type="text"
            required
            class="input w-full"
            placeholder="Lieu"
          />
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Date</legend>
          <input v-model="date" type="date" required class="input w-full" />
        </fieldset>

        <div class="modal-action">
          <Button type="button" color="secondary" variant="ghost" @click="closeModal">
            Annuler
          </Button>
          <Button color="primary">Créer</Button>
        </div>
      </form>
    </div>
  </dialog>
</template>

<style scoped></style>
