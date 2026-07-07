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

</script>

<template>
  <main class="min-h-screen bg-base-200 p-10 flex flex-col gap-8">
    <h1 class="text-3xl font-bold">UI Showcase — Button</h1>

    <section>
      <h2 class="text-xl font-semibold">Fight list</h2>
      <FightList></FightList>
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
