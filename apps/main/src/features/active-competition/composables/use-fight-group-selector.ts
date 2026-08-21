import { computed, ref, watch, type Ref } from "vue";
import {
  FightStatus,
  getBracketRoundLabel,
  poolNumberOf,
  type ActiveCompetitionView,
  type BracketPendingMatch,
  type BracketRoundId,
  type FightRecord,
  type PoolId,
} from "@hajime/core";
import type { SelectorItem } from "@hajime/ui";

const POOL_PREFIX = "pool:";
const ROUND_PREFIX = "round:";
const THIRD_PLACE_LABEL = "3rd place match";

type CompetitionPhase = "pool" | "bracket";

function completionRatio(fights: readonly FightRecord[]): number | undefined {
  if (fights.length === 0) return undefined;

  const finishedCount = fights.filter((fight) => fight.status === FightStatus.Finished).length;
  return finishedCount / fights.length;
}

/**
 * Drives the two-level fight group picker used by `FightScreen`: which phase of the
 * competition to look at (pool phase / bracket phase), then which group within that phase
 * (a given pool, a given bracket round, or the third-place match) — and exposes the fights of
 * whichever group is currently selected, plus that group's still-pending bracket matches (both
 * fighters not yet known) so the screen can show them as placeholder rows instead of hiding
 * them entirely.
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
        .sort((a, b) => poolNumberOf(a.id) - poolNumberOf(b.id))
        .map((pool) => ({
          id: `${POOL_PREFIX}${pool.id}`,
          label: `Pool ${poolNumberOf(pool.id)}`,
          progress: completionRatio(view.value.poolFights(pool.id)),
        }));
    }

    if (selectedPhase.value === "bracket") {
      // --- ONLY "main" ROUNDS COUNT TOWARDS THE TOTAL USED TO LABEL A ROUND BY ITS DISTANCE
      // FROM THE FINAL — THE THIRD-PLACE ROUND ISN'T PART OF THAT LADDER, IT GETS ITS OWN
      // FIXED LABEL BELOW. ---
      const totalMainRounds = view.value.bracketRounds.filter(
        (round) => (round.kind ?? "main") === "main",
      ).length;

      return [...view.value.bracketRounds]
        .sort((a, b) => a.order - b.order)
        .map((round) => ({
          id: `${ROUND_PREFIX}${round.id}`,
          label:
            round.kind === "thirdPlace"
              ? THIRD_PLACE_LABEL
              : getBracketRoundLabel(round.order, totalMainRounds),
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
      const poolId = id.slice(POOL_PREFIX.length) as PoolId;
      return [...view.value.poolFights(poolId)];
    }

    if (id.startsWith(ROUND_PREFIX)) {
      const bracketRoundId = id.slice(ROUND_PREFIX.length) as BracketRoundId;
      return [...view.value.bracketRoundFights(bracketRoundId)];
    }

    return [];
  });

  // --- THE SELECTED BRACKET ROUND'S MATCHES NOT PLAYABLE YET (ONE OR BOTH FIGHTERS STILL
  // UNKNOWN) — EMPTY FOR A POOL GROUP, SINCE POOL FIGHTS ARE ALL KNOWN UPFRONT. ---
  const groupPendingMatches = computed<
    { bracketRoundId: BracketRoundId; match: BracketPendingMatch }[]
  >(() => {
    const id = selectedGroupId.value;
    if (!id || !id.startsWith(ROUND_PREFIX)) return [];

    const bracketRoundId = id.slice(ROUND_PREFIX.length) as BracketRoundId;
    const round = view.value.bracketRounds.find((round) => round.id === bracketRoundId);
    if (!round) return [];

    return round.pendingMatches.map((match) => ({ bracketRoundId, match }));
  });

  // --- WHETHER THE CURRENTLY SELECTED GROUP'S FIGHTS CAN BE OPENED. TRUE FOR THE POOL PHASE
  // AND FOR ANY BRACKET ROUND WITH NO DEPENDENCY (THE FIRST ROUND PLAYED). OTHERWISE, ONLY
  // TRUE ONCE THE ROUND IT dependsOnRoundId POINTS AT IS FULLY CONCLUDED: NO MORE PENDING
  // MATCHES, AND EVERY REAL FIGHT OF THAT ROUND FINISHED. THE FINAL AND THE THIRD-PLACE MATCH
  // BOTH POINT AT THE SEMI-FINALS HERE, SO EITHER CAN OPEN AS SOON AS THE SEMI-FINALS ARE
  // DONE, INDEPENDENTLY OF ONE ANOTHER. ---
  const isSelectedGroupUnlocked = computed<boolean>(() => {
    const id = selectedGroupId.value;
    if (!id || !id.startsWith(ROUND_PREFIX)) return true;

    const bracketRoundId = id.slice(ROUND_PREFIX.length) as BracketRoundId;
    const round = view.value.bracketRounds.find((round) => round.id === bracketRoundId);
    if (!round || !round.dependsOnRoundId) return true;

    const dependsOn = view.value.bracketRounds.find(
      (candidate) => candidate.id === round.dependsOnRoundId,
    );
    if (!dependsOn) return true;

    if (dependsOn.pendingMatches.length > 0) return false;

    return view.value
      .bracketRoundFights(dependsOn.id)
      .every((fight) => fight.status === FightStatus.Finished);
  });

  return {
    phaseItems,
    selectedPhase,
    groupItems,
    selectedGroupId,
    groupFights,
    groupPendingMatches,
    isSelectedGroupUnlocked,
  };
}
