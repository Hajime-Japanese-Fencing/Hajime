<script setup lang="ts">
import type {FighterDetails} from "@hajime/ui/src/components/PoolCard/fighter-details.interface.ts";
import type {PoolDetails} from "@hajime/ui/src/components/PoolCard/pool-details.interface.ts";
import type {FighterPointsRanked} from "@hajime/ui/src/components/RankingDetails/fighter-points-ranked.interface.ts";
import { Button, SecondaryButton, GhostButton, OutlineButton, AccentButton, RoundButton, SquareButton, PoolCard, FightList } from "@hajime/ui";
import { ref} from "vue";

const fighterPoints = ref<FighterPointsRanked[]>([
      {
        fighterName: "john",
        points: 2,
        nbVictories: 3,
        nbGivenIppons: 4,
        nbReceivedIppons: 2,
        poolRank: 1,
      },
      {
        fighterName: "dave",
        points: -1,
        nbVictories: 1,
        nbGivenIppons: 2,
        nbReceivedIppons: 4,
        poolRank: 3
      },
      {
        fighterName: "dave",
        points: -1,
        nbVictories: 1,
        nbGivenIppons: 2,
        nbReceivedIppons: 4,
        poolRank: 2
      },
    ])

const fighters = ref<FighterDetails[]>([
      {
        fighterName: 'john',
        poolRank: 1,
        number: 2,
      },
      {
        fighterName: 'dave',
        poolRank: 3,
        number: 1,
      },
      {
        fighterName: 'dave',
        poolRank: 2,
        number: 3,
      },
    ])

const poolDetails = ref<PoolDetails>({
      poolId: 1,
      fighters: fighters
    })

type Fight = {
  id: number;
  fighter1: string;
  fighter2: string;
  score: string | null;
  status: FightStatus;
  scoreEvents: ScoreEvent[];
  editable: boolean;
};

type FightStatus = "Waiting" | "In progress" | "Finished";

const fights = ref<Fight[]>([
  {
    id: 1,
    fighter1: "Tanaka",
    fighter2: "Suzuki",
    score: null,
    status: "Waiting",
    scoreEvents: [],
    editable: true
  },
  {
    id: 2,
    fighter1: "Yamamoto",
    fighter2: "Sato",
    score: "2 - 1",
    status: "Finished",
    scoreEvents: [
      {id: 1, leftFighter: true, type: "ippon", code: "M", variant: "outline"},
      {id: 2, leftFighter: false, type: "hansoku", code: "Δ", variant: "filled"},
      {id: 3, leftFighter: false, type: "ippon", code: "D", variant: "filled"},
      {id: 4, leftFighter: true, type: "ippon", code: "K", variant: "filled"},
    ],
    editable: false
  },
  {
    id: 3,
    fighter1: "Ito",
    fighter2: "Kobayashi",
    score: null,
    status: "Waiting",
    scoreEvents: [],
    editable: true
  },
]);

type ScoreEvent = {
  id: number;
  leftFighter: boolean
  type: "ippon" | "hansoku";
  code: "K" | "M" | "D" | "T" | "Δ";
  variant: "filled" | "outline";
};


const openedFightId = ref<number  | null>(null);

function onOpenFight(id: number) {
  const fight = fights.value.find(f => f.id === id);

  if (!fight) {
    return;
  }

  openedFightId.value = id;

  if (fight.status === "Waiting") {
    updateFightStatus(id, "In progress");
  }
}

function onCloseFight() {
  openedFightId.value = null;
}

function onCancelFight(id: number) {
  openedFightId.value = null;
  updateFightStatus(id, "Waiting");
}

function onValidateFight(id: number) {
  openedFightId.value = null;
  updateFightStatus(id, "Finished");
}

function onForfeitFight(id: number) {
  openedFightId.value = null;
  updateFightStatus(id, "Finished");
}

function updateFightStatus(id: number, status: FightStatus) {
  const fight = fights.value.find(f => f.id === id);

  if (!fight) {
    return;
  }

  // TODO: remplacer par appel API
  fight.status = status;
}

</script>

<template>
  <main class="min-h-screen bg-base-200 p-10 flex flex-col gap-8">
    <h1 class="text-3xl font-bold">UI Showcase — Button</h1>

    <section>
      <h2 class="text-xl font-semibold">Fight list</h2>
      <FightList
          :fights="fights"
          :opened-fight-id="openedFightId"
          @open-fight="onOpenFight"
          @close-fight="onCloseFight"
          @cancel-fight="onCancelFight"
          @validate-fight="onValidateFight"
          @forfeit-fight="onForfeitFight"
      />
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Variants</h2>
      <div class="flex flex-wrap gap-3">
        <Button>Primary</Button>
        <SecondaryButton>Secondary</SecondaryButton>
        <AccentButton>Accent</AccentButton>
        <GhostButton>Ghost</GhostButton>
        <OutlineButton>Outline</OutlineButton>
      </div>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Sizes</h2>
      <div class="flex flex-wrap items-end gap-3">
        <Button size="xs">Extra Small</Button>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Disabled</h2>
      <div class="flex flex-wrap gap-3">
        <Button disabled>Disabled</Button>
        <Button variant="secondary" disabled>Disabled Secondary</Button>
      </div>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Shape</h2>
      <div class="flex flex-wrap gap-3">
        <Button>Default</Button>
        <SquareButton>Square</SquareButton>
        <RoundButton>Circle</RoundButton>
      </div>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Mon composant</h2>
      <a></a>
      <PoolCard :pool-details="poolDetails" :rankingDetails="fighterPoints"></PoolCard>
    </section>
  </main>
</template>
