import { computed, ref, watch, type Ref } from "vue";
import { getBracketRoundLabel, type ActiveCompetitionView, type FightRecord } from "@hajime/core";
import type { SelectorItem } from "@hajime/ui";

const POOL_PREFIX = "pool:";
const ROUND_PREFIX = "round:";

/**
 * Derives the list of selectable fight groups (pools + bracket rounds) from the active
 * competition, and exposes the fights belonging to whichever group is currently selected.
 *
 * Meant to feed a `SelectorList` (group picker) and a `FightList` (filtered fights) together,
 * e.g. in `FightScreen`.
 */
export function useFightGroupSelector(view: Ref<ActiveCompetitionView>) {
  const items = computed<SelectorItem[]>(() => {
    const poolItems = [...view.value.pools]
      .sort((a, b) => a.id - b.id)
      .map((pool) => ({ id: `${POOL_PREFIX}${pool.id}`, label: `Pool ${pool.id}` }));

    const totalRounds = view.value.bracketRounds.length;
    const roundItems = [...view.value.bracketRounds]
      .sort((a, b) => a.order - b.order)
      .map((round) => ({
        id: `${ROUND_PREFIX}${round.id}`,
        label: getBracketRoundLabel(round.order, totalRounds),
      }));

    return [...poolItems, ...roundItems];
  });

  const selectedGroupId = ref<string | null>(null);

  // --- KEEPS THE SELECTION VALID AS THE COMPETITION LOADS OR CHANGES: DEFAULTS TO THE FIRST
  // GROUP, AND FALLS BACK TO IT IF THE CURRENTLY SELECTED GROUP DISAPPEARS. ---
  watch(
    items,
    (currentItems) => {
      if (currentItems.length === 0) {
        selectedGroupId.value = null;
        return;
      }

      if (!currentItems.some((item) => item.id === selectedGroupId.value)) {
        selectedGroupId.value = currentItems[0].id;
      }
    },
    { immediate: true },
  );

  const groupFights = computed<FightRecord[]>(() => {
    const id = selectedGroupId.value;
    if (!id) return [];

    if (id.startsWith(POOL_PREFIX)) {
      const poolId = Number(id.slice(POOL_PREFIX.length)) as Parameters<
        ActiveCompetitionView["poolFights"]
      >[0];
      return [...view.value.poolFights(poolId)];
    }

    if (id.startsWith(ROUND_PREFIX)) {
      const bracketRoundId = Number(id.slice(ROUND_PREFIX.length)) as Parameters<
        ActiveCompetitionView["bracketRoundFights"]
      >[0];
      return [...view.value.bracketRoundFights(bracketRoundId)];
    }

    return [];
  });

  return { items, selectedGroupId, groupFights };
}
