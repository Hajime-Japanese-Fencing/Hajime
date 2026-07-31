// --- LABELS A ROUND BY HOW MANY ROUNDS SEPARATE IT FROM THE FINAL, RATHER THAN BY ITS
// OWN ORDER: THE FINAL IS ALWAYS THE LAST ROUND REGARDLESS OF THE BRACKET SIZE. ---
export function getBracketRoundLabel(order: number, totalRounds: number): string {
  const roundsFromFinal = totalRounds - order;

  switch (roundsFromFinal) {
    case 0:
      return "Final";
    case 1:
      return "Semi-finals";
    case 2:
      return "Quarter-finals";
    default: {
      const nbFighters = 2 ** (roundsFromFinal + 1);
      return `Round of ${nbFighters}`;
    }
  }
}
