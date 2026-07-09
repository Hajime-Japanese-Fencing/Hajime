import type { FighterPoints } from "./fighter-points.interface.ts";
import type { RankingDetail } from "../components/RankingDetails/ranking-detail.interface.ts";

export function calculateFighterRanks(fighters: FighterPoints[]): RankingDetail[] {
  const sortedFighters = [...fighters].sort((fighter1, fighter2) => {
    if (fighter2.points !== fighter1.points) return fighter2.points - fighter1.points;
    if (fighter2.nbVictories !== fighter1.nbVictories)
      return fighter2.nbVictories - fighter1.nbVictories;
    if (fighter2.nbGivenIppons !== fighter1.nbGivenIppons)
      return fighter2.nbGivenIppons - fighter1.nbGivenIppons;
    return fighter1.nbReceivedIppons - fighter2.nbReceivedIppons;
  });

  let sortedFightersRanked: RankingDetail[] = [];

  sortedFighters.forEach((value, index) => {
    sortedFightersRanked[index] = {
      fighterName: value.fighterName,
      points: value.points,
      nbVictories: value.nbVictories,
      nbGivenIppons: value.nbGivenIppons,
      nbReceivedIppons: value.nbReceivedIppons,
      poolRank: index + 1,
    };
  });

  return sortedFightersRanked;
}
