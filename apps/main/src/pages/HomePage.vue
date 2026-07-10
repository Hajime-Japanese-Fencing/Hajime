<script setup lang="ts">
import { useRouter } from "vue-router";
import { AlertError, TablePlaceholder } from "@hajime/ui";
import { useContainer } from "../bootstrap/container/useContainer.ts";
import { useCompetitions } from "../competitions/queries/use-competitions.ts";
import CompetitionList from "../competitions/components/CompetitionList.vue";

const router = useRouter();
const { retrieveCompetitions } = useContainer();
const { data: competitions, isLoading, error } = useCompetitions(retrieveCompetitions);

function onSelectCompetition(id: string) {
  router.push({ name: "competition", params: { id } });
}
</script>

<template>
  <main class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Competitions</h1>

    <TablePlaceholder v-if="isLoading" :rows="5" :columns="4" />

    <AlertError v-else-if="error">Oops.. Unable to load competitions.</AlertError>

    <CompetitionList
      v-else-if="competitions && competitions.length > 0"
      :competitions="competitions"
      @select="onSelectCompetition"
    />

    <div v-else class="text-center py-10 text-base-content/60">No competitions found.</div>
  </main>
</template>
