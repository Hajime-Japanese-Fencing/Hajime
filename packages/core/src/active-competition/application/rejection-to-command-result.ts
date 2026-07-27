import type { RejectionReason } from "../domain/fight/fight-rules.ts";
import type { FightActionResult } from "./command-result.ts";

export function toCommandRejection(reason: RejectionReason): FightActionResult {
  if (reason === "scoring_not_allowed") return { ok: false, reason };

  return { ok: false, reason: "illegal_transition" };
}
