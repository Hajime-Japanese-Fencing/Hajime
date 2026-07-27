import type { RejectionReason } from "../domain/fight/fight-rules.ts";
import type { CommandResult } from "./command-result.ts";

export function toCommandRejection(reason: RejectionReason): CommandResult {
  if (reason === "scoring_not_allowed") return { ok: false, reason };

  return { ok: false, reason: "illegal_transition" };
}
