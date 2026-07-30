<script setup lang="ts">
import { Badge } from "@hajime/ui";
import { type CompetitionOverview, CompetitionStatusLabel } from "@hajime/core";
import { colorFromStatus } from "./status-color.helper";

defineProps<{
  competitions: CompetitionOverview[];
}>();

const emit = defineEmits<{
  select: [id: string];
}>();
</script>

<template>
  <div class="overflow-x-auto rounded-box shadow-md">
    <table class="table table-zebra">
      <thead>
        <tr>
          <th>Competition</th>
          <th>Place</th>
          <th>Date</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="competition in competitions"
          :key="competition.id"
          class="cursor-pointer hover:bg-base-200 transition-colors"
          @click="emit('select', competition.id)"
        >
          <td class="font-semibold">{{ competition.name }}</td>
          <td class="font-semibold">{{ competition.place }}</td>
          <td class="text-sm text-base-content/70">{{ competition.date.toHumanString() }}</td>
          <td>
            <Badge :color="colorFromStatus(competition.status)" variant="soft">
              {{ CompetitionStatusLabel[competition.status] }}
            </Badge>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
