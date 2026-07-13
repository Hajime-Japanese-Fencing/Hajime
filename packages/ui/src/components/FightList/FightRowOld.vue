<script setup lang="ts">
import { ArchiveRestore, Eye, EyeOff } from "lucide-vue-next";
import IpponAssignButtons from "./IpponAssignButtons.vue";
import DropdownComboButton from "./DropdownComboButton.vue";
import Badge from "../DataDisplay/Badge.vue";
import IconButton from "../Actions/Button/IconButton.vue";
import { computed } from "vue";
import IpponResultList from "./IpponResultList.vue";
import type { Fight, Action, AssignIpponEvent } from "./types.ts";
import { StatusColor } from "./types.ts";
import type { AssignableIpponCode, IpponCode } from "@hajime/core";
import { FightStatus, FightStatusLabel, Side } from "@hajime/core";

/**
 * @todo Simplifier en faveur de FightRowProps
 */
const props = defineProps<{
  fight: Fight;
  active: boolean;
  locked: boolean;
  leftSide: Side;
  rightSide: Side;
}>();

interface FightRowProps {
  fightStatus: FightStatus;
  active: boolean;
  leftFighter: SideFighter; // Juste le nom si utilisation de slots
  rightFighter: SideFighter; // Juste le nom si utilisation de slots
}

interface SideFighter {
  fighterId: string; // Obsolète si utilisation de slots
  fighterName: string;
  ipponsGiven: IpponCode[]; // Obsolète si utilisation de slots
  numberOfHansoku: number; // Obsolète si utilisation de slots
}

/**
 * @todo Supprimer en faveur d'un slot "Actions" pour laisser FightList décider des boutons d'Actions
 */
const emit = defineEmits<{
  openFight: [id: number];
  closeFight: [];
  cancelFight: [id: number];
  validateFight: [id: number];
  forfeitFight: [id: number];
  assignIppon: [event: AssignIpponEvent];
}>();

/**
 * @todo Séparer Ippons des Hansokus, les Hansokus sont des pénalités
 * A terme ces 4 computed dégageront
 */
const leftHansokus = computed(() =>
  props.fight.scoreEvents
    .filter(({ leftSide: leftFighter, type }) => leftFighter && type === "hansoku")
    .map(({ id, code, firstBlood }) => ({ id, code, firstBlood })),
);

const rightHansokus = computed(() =>
  props.fight.scoreEvents
    .filter(({ leftSide: leftFighter, type }) => !leftFighter && type === "hansoku")
    .map(({ id, code, firstBlood }) => ({ id, code, firstBlood })),
);

const leftIppons = computed(() =>
  props.fight.scoreEvents
    .filter(({ leftSide: leftFighter, type }) => leftFighter && type === "ippon")
    .map(({ id, code, firstBlood }) => ({ id, code, firstBlood })),
);

const rightIppons = computed(() =>
  props.fight.scoreEvents
    .filter(({ leftSide: leftFighter, type }) => !leftFighter && type === "ippon")
    .map(({ id, code, firstBlood }) => ({ id, code, firstBlood })),
);

function removeLeftHansoku(id: number) {}

function removeRightHansoku(id: number) {}

function removeLeftIppon(id: number) {}

function removeRightIppon(id: number) {}

/**
 * @todo réfléchir si des slots pour affichage scoring/liste ippons avec les boutons d'annulation seraient pas plus pertinent
 * Pareil avec la IpponAssignButtons utilisé dans un slot du parent
 * Je pense qu'on gagnerait en clarté en faisant comme cela
 * @todo en séparant ippons de hansoku il y aura un assignHansoku et un removeHansoku
 * @todo removeIppon également
 */
function onIpponClicked(side: Side, code: AssignableIpponCode) {
  emit("assignIppon", {
    side,
    code,
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
</script>

<template>
  <tr :class="[props.active ? 'bg-base-200' : 'hover:bg-base-200']">
    <td class="p-0">
      <div :class="props.active ? 'grid grid-rows-[auto_1fr_auto] h-full' : ''">
        <div class="grid grid-cols-[auto_1fr] items-center">
          <!-- Boutons -->
          <div class="w-48 pt-1">
            <span v-if="props.active" class="gap-2">
              <IpponAssignButtons @click="(code) => onIpponClicked(props.leftSide, code)" />
            </span>
          </div>
          <!-- Nom -->
          <span class="text-right font-medium justify-self-end">
            {{ props.fight.fighter1 }}
          </span>
        </div>

        <!-- Hansoku -->
        <div class="flex justify-start gap-2 mt-4 h-8" v-if="props.active">
          <IpponResultList
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
              <IpponResultList
                :tokens="leftIppons"
                :removable="props.fight.editable"
                @remove="removeLeftIppon"
              />
            </div>

            <div></div>

            <div class="flex justify-start gap-2 ml-2">
              <IpponResultList
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
              <IpponAssignButtons @click="(code) => onIpponClicked(props.rightSide, code)" />
            </span>
          </div>
        </div>

        <!-- Hansoku -->
        <div class="flex justify-end gap-2 mt-4 h-8" v-if="props.active">
          <IpponResultList
            :tokens="rightHansokus"
            :removable="props.fight.editable"
            @remove="removeRightHansoku"
          />
        </div>
      </div>
    </td>

    <td class="w-px whitespace-nowrap">
      <Badge :color="StatusColor[props.fight.status]" variant="soft">
        {{ FightStatusLabel[props.fight.status] }}
      </Badge>
    </td>

    <td class="">
      <div v-if="!props.active" class="flex justify-center">
        <IconButton variant="outline" @click="onOpenFight" :disabled="props.locked">
          <Eye v-if="props.fight.status === FightStatus.Finished" />
          <ArchiveRestore v-else />
        </IconButton>
      </div>

      <div v-else class="flex flex-col gap-3 items-center justify-center">
        <DropdownComboButton
          v-if="props.fight.status === FightStatus.InProgress"
          :id="props.fight.id"
          @action="handleAction"
        />
        <IconButton v-else variant="outline" @click="onCloseFight">
          <EyeOff />
        </IconButton>
      </div>
    </td>
  </tr>
</template>

<style scoped>
.table td {
  border-color: #33333340;
}
</style>
