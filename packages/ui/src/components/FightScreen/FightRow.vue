<script setup lang="ts">
import { BiArchiveOut } from "vue-icons-plus/bi";
import { BsEye, BsEyeSlash } from "vue-icons-plus/bs";
import IpponButtons from "./IpponButtons.vue";
import DropdownComboButton from "./DropdownComboButton.vue";
import Badge from "./Badge.vue";
import RoundButton from "../Button/RoundButton.vue";
import { computed } from "vue";
import ScoreTokenList from "./ScoreTokenList.vue";
import type { FightStatus } from "./FightList.vue";
import type { NewScoreEvent, ScoreEvent } from "./FightScreen.vue";

type Fight = {
  id: number;
  fighter1: string;
  fighter2: string;
  score: string | null;
  status: FightStatus;
  scoreEvents: ScoreEvent[];
  editable: boolean;
};

type Action = "validate" | "cancel" | "forfeit";
type BadgeColor =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "success"
  | "info"
  | "warning"
  | "error";

type Side = {
  label: "Red" | "White";
  bgClass: string;
  textClass: string;
};

const props = defineProps<{
  fight: Fight;
  active: boolean;
  locked: boolean;
  leftSide: Side;
  rightSide: Side;
}>();

const emit = defineEmits<{
  openFight: [id: number];
  closeFight: [];
  cancelFight: [id: number];
  validateFight: [id: number];
  forfeitFight: [id: number];
  addScoreEvent: [event: NewScoreEvent];
}>();

function addIppon(leftFighter: boolean, code: ScoreEvent["code"]) {
  emit("addScoreEvent", {
    leftFighter,
    type: code === "Δ" ? "hansoku" : "ippon",
    code,
    variant: "filled",
  });
}

function handleAction(action: Action) {
  switch (action) {
    case "validate":
      emit("validateFight", props.fight.id);
      break;

    case "cancel":
      emit("cancelFight", props.fight.id);
      break;

    case "forfeit":
      emit("forfeitFight", props.fight.id);
      break;
  }
}

function onOpenFight() {
  emit("openFight", props.fight.id);
}

function onCloseFight() {
  emit("closeFight");
}

const statusColors: Record<string, BadgeColor> = {
  Waiting: "info",
  "In progress": "accent",
  Finished: "success",
};

const leftHansokus = computed(() =>
  props.fight.scoreEvents
    .filter(({ leftFighter, type }) => leftFighter && type === "hansoku")
    .map(({ id, code, variant }) => ({ id, code, variant })),
);

const rightHansokus = computed(() =>
  props.fight.scoreEvents
    .filter(({ leftFighter, type }) => !leftFighter && type === "hansoku")
    .map(({ id, code, variant }) => ({ id, code, variant })),
);

const leftIppons = computed(() =>
  props.fight.scoreEvents
    .filter(({ leftFighter, type }) => leftFighter && type === "ippon")
    .map(({ id, code, variant }) => ({ id, code, variant })),
);

const rightIppons = computed(() =>
  props.fight.scoreEvents
    .filter(({ leftFighter, type }) => !leftFighter && type === "ippon")
    .map(({ id, code, variant }) => ({ id, code, variant })),
);

function removeLeftHansoku(id: number) {}

function removeRightHansoku(id: number) {}

function removeLeftIppon(id: number) {}

function removeRightIppon(id: number) {}
</script>

<template>
  <tr :class="[props.active ? 'bg-base-200' : 'hover:bg-base-200']">
    <td class="p-0">
      <div :class="props.active ? 'grid grid-rows-[auto_1fr_auto] h-full' : ''">
        <div class="grid grid-cols-[auto_1fr] items-center">
          <!-- Boutons -->
          <div class="w-48 pt-1">
            <span v-if="props.active" class="gap-2">
              <IpponButtons @addIppon="(code) => addIppon(true, code)" />
            </span>
          </div>
          <!-- Nom -->
          <span class="text-right font-medium justify-self-end">
            {{ props.fight.fighter1 }}
          </span>
        </div>

        <!-- Hansoku -->
        <div class="flex justify-start gap-2 mt-4 h-8" v-if="props.active">
          <ScoreTokenList
            :tokens="leftHansokus"
            :removable="props.fight.editable"
            @remove="removeLeftHansoku"
          />
        </div>
      </div>
    </td>

    <td class="w-40 relative p-0">
      <!-- Content -->
      <div class="relative z-10 h-full">
        <div
          v-if="props.active"
          class="flex flex-col items-center justify-center h-full py-2 gap-2"
        >
          <div class="font-semibold leading-none">
            {{ props.fight.score ?? "VS" }}
          </div>

          <div class="grid grid-cols-[1fr_auto_1fr] items-center w-full">
            <div class="flex justify-end gap-2 mr-2">
              <ScoreTokenList
                :tokens="leftIppons"
                :removable="props.fight.editable"
                @remove="removeLeftIppon"
              />
            </div>

            <div></div>

            <div class="flex justify-start gap-2 ml-2">
              <ScoreTokenList
                :tokens="rightIppons"
                :removable="props.fight.editable"
                @remove="removeRightIppon"
              />
            </div>
          </div>
        </div>

        <div v-else class="flex items-center justify-center h-full font-semibold">
          {{ props.fight.score ?? "VS" }}
        </div>
      </div>
    </td>

    <td class="p-0">
      <div :class="props.active ? 'grid grid-rows-[auto_1fr_auto] h-full' : ''">
        <div class="grid grid-cols-[1fr_auto] items-center">
          <!-- Nom -->
          <span class="text-left font-medium justify-self-start">
            {{ props.fight.fighter2 }}
          </span>
          <!-- Boutons -->
          <div class="w-48 pt-1">
            <span v-if="props.active" class="gap-2">
              <IpponButtons
                @addIppon="(code) => addIppon(false, code)"
                :textColor="props.rightSide.textClass"
              />
            </span>
          </div>
        </div>

        <!-- Hansoku -->
        <div class="flex justify-end gap-2 mt-4 h-8" v-if="props.active">
          <ScoreTokenList
            :tokens="rightHansokus"
            :removable="props.fight.editable"
            @remove="removeRightHansoku"
          />
        </div>
      </div>
    </td>

    <td class="">
      <Badge :color="statusColors[props.fight.status]" variant="outline">
        {{ props.fight.status }}
      </Badge>
    </td>

    <td class="">
      <div v-if="!props.active" class="flex justify-center">
        <RoundButton
          size="sm"
          variant="outline"
          @click="onOpenFight"
          :disabled="props.locked"
          :class="props.locked ? '' : 'bg-neutral text-neutral-content'"
        >
          <BsEye v-if="props.fight.status === 'Finished'" />
          <BiArchiveOut v-else />
        </RoundButton>
      </div>

      <div v-else class="flex flex-col gap-3 items-center justify-center">
        <DropdownComboButton
          v-if="props.fight.status === 'In progress'"
          :id="props.fight.id"
          @action="handleAction"
        />
        <RoundButton
          v-else
          size="sm"
          variant="outline"
          class="bg-neutral text-neutral-content"
          @click="onCloseFight"
        >
          <BsEyeSlash />
        </RoundButton>
      </div>
    </td>
  </tr>
</template>

<style scoped>
.table td {
  border-color: #33333340;
}
</style>
