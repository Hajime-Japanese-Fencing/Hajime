import { computed, ref, watch, type Ref } from "vue";
import {
  FightStatus,
  getBracketRoundLabel,
  type ActiveCompetitionView,
  type FightRecord,
} from "@hajime/core";
import type { SelectorItem } from "@hajime/ui";

const POOL_PREFIX = "pool:";
const ROUND_PREFIX = "round:";

type CompetitionPhase = "pool" | "bracket";

function completionRatio(fights: readonly FightRecord[]): number | undefined {
  if (fights.length === 0) return undefined;

  const finishedCount = fights.filter((fight) => fight.status === FightStatus.Finished).length;
  return finishedCount / fights.length;
}

/**
 * Drives the two-level fight group picker used by `FightScreen`: which phase of the
 * competition to look at (pool phase / bracket phase), then which group within that phase
 * (a given pool, or a given bracket round) — and exposes the fights of whichever group is
 * currently selected.
 *
 * Group items (not phase items) carry a `progress` ratio (finished fights / total fights in
 * that group), meant to fill a `SelectorList` left-to-right as fights complete.
 */
export function useFightGroupSelector(view: Ref<ActiveCompetitionView>) {
  const phaseItems = computed<SelectorItem[]>(() => {
    const items: SelectorItem[] = [];
    if (view.value.pools.length > 0) items.push({ id: "pool", label: "Pools" });
    if (view.value.bracketRounds.length > 0) items.push({ id: "bracket", label: "Bracket" });
    return items;
  });

  const selectedPhase = ref<CompetitionPhase | null>(null);

  // --- KEEPS THE PHASE SELECTION VALID AS THE COMPETITION LOADS OR CHANGES: DEFAULTS TO THE
  // FIRST AVAILABLE PHASE, AND FALLS BACK TO IT IF THE CURRENT PHASE DISAPPEARS. ---
  watch(
    phaseItems,
    (currentItems) => {
      if (currentItems.length === 0) {
        selectedPhase.value = null;
        return;
      }

      if (!currentItems.some((item) => item.id === selectedPhase.value)) {
        selectedPhase.value = currentItems[0].id as CompetitionPhase;
      }
    },
    { immediate: true },
  );

  const groupItems = computed<SelectorItem[]>(() => {
    if (selectedPhase.value === "pool") {
      return [...view.value.pools]
        .sort((a, b) => a.id - b.id)
        .map((pool) => ({
          id: `${POOL_PREFIX}${pool.id}`,
          label: `Pool ${pool.id}`,
          progress: completionRatio(view.value.poolFights(pool.id)),
        }));
    }

    if (selectedPhase.value === "bracket") {
      const totalRounds = view.value.bracketRounds.length;
      return [...view.value.bracketRounds]
        .sort((a, b) => a.order - b.order)
        .map((round) => ({
          id: `${ROUND_PREFIX}${round.id}`,
          label: getBracketRoundLabel(round.order, totalRounds),
          progress: completionRatio(view.value.bracketRoundFights(round.id)),
        }));
    }

    return [];
  });

  const selectedGroupId = ref<string | null>(null);

  // --- SAME FALLBACK LOGIC AS THE PHASE SELECTION, ONE LEVEL DOWN: DEFAULTS TO THE FIRST
  // GROUP OF THE CURRENT PHASE, AND RE-DEFAULTS WHENEVER THE PHASE (HENCE THE GROUP LIST)
  // CHANGES OR THE SELECTED GROUP DISAPPEARS. ---
  watch(
    groupItems,
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

  return { phaseItems, selectedPhase, groupItems, selectedGroupId, groupFights };
}
