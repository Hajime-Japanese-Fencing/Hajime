<script setup lang="ts">
import { ref, useId } from "vue";
import Button from "../Actions/Button/Button.vue";
import CloseButton from "../Overlay/CloseButton.vue";
import {
  CompetitionFormat,
  CompetitionFormatLabel,
  CompetitionType,
  CompetitionTypeLabel,
  type NewCompetitionPayload,
} from "./new-competition-payload.interface.ts";

const emit = defineEmits<{
  create: [payload: NewCompetitionPayload];
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);
const name = ref("");
const place = ref("");
const date = ref("");
const format = ref<CompetitionFormat>(CompetitionFormat.Bracket);
const type = ref<CompetitionType>(CompetitionType.Individual);
const repulseByClub = ref(true);
const repulseBySeed = ref(true);

// --- UNIQUE PER INSTANCE SO TWO <NewCompetition> ON THE SAME PAGE DON'T SHARE ONE NATIVE RADIO
// GROUP (RADIOS ARE GROUPED BY THE name ATTRIBUTE ALONE, GLOBALLY ACROSS THE DOCUMENT — A
// HARDCODED name WOULD LET PICKING A FORMAT IN ONE MODAL SILENTLY UNCHECK THE OTHER). ---
const formatGroupName = useId();
const typeGroupName = useId();

function openModal(): void {
  dialogRef.value?.showModal();
}

function closeModal(): void {
  dialogRef.value?.close();
}

function onSubmit(): void {
  emit("create", {
    name: name.value,
    place: place.value,
    date: date.value,
    format: format.value,
    type: type.value,
    repulseByClub: repulseByClub.value,
    repulseBySeed: repulseBySeed.value,
  });
  closeModal();
}

// --- RESETS THE FORM WHENEVER THE DIALOG CLOSES, NO MATTER HOW (SUBMIT, THE TOP-RIGHT
// CloseButton, "Annuler", OR THE ESC KEY) — THE NATIVE <dialog> "close" EVENT FIRES IN ALL OF
// THOSE CASES, SO THIS IS THE ONE PLACE THAT NEEDS TO HANDLE IT. ---
function resetForm(): void {
  name.value = "";
  place.value = "";
  date.value = "";
  format.value = CompetitionFormat.Bracket;
  type.value = CompetitionType.Individual;
  repulseByClub.value = true;
  repulseBySeed.value = true;
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

        <div class="flex justify-between">
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Format</legend>
            <div class="flex flex-col gap-2">
              <label class="label cursor-pointer justify-start gap-2">
                <input
                  v-model="format"
                  type="radio"
                  :name="formatGroupName"
                  :value="CompetitionFormat.Bracket"
                  class="radio radio-primary"
                />
                {{ CompetitionFormatLabel[CompetitionFormat.Bracket] }}
              </label>
              <label class="label cursor-pointer justify-start gap-2">
                <input
                  v-model="format"
                  type="radio"
                  :name="formatGroupName"
                  :value="CompetitionFormat.PoolAndBracket"
                  class="radio radio-primary"
                />
                {{ CompetitionFormatLabel[CompetitionFormat.PoolAndBracket] }}
              </label>
            </div>
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">Type</legend>
            <div class="flex flex-col gap-2">
              <label class="label cursor-pointer justify-start gap-2">
                <input
                  v-model="type"
                  type="radio"
                  :name="typeGroupName"
                  :value="CompetitionType.Individual"
                  class="radio radio-primary"
                />
                {{ CompetitionTypeLabel[CompetitionType.Individual] }}
              </label>
              <label class="label cursor-pointer justify-start gap-2">
                <input
                  v-model="type"
                  type="radio"
                  :name="typeGroupName"
                  :value="CompetitionType.Team"
                  class="radio radio-primary"
                />
                {{ CompetitionTypeLabel[CompetitionType.Team] }}
              </label>
            </div>
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">Répartition</legend>
            <div class="flex flex-col gap-2">
              <label class="label cursor-pointer justify-between gap-4">
                Répulsion par club
                <input v-model="repulseByClub" type="checkbox" class="toggle toggle-primary" />
              </label>
              <label class="label cursor-pointer justify-between gap-4">
                Répulsion par seed
                <input v-model="repulseBySeed" type="checkbox" class="toggle toggle-primary" />
              </label>
            </div>
          </fieldset>
        </div>

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
