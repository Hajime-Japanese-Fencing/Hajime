import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { CompetitionDate, type CompetitionOverview } from "@hajime/core";
import type { NewCompetitionPayload } from "@hajime/ui";
import { useContainer } from "../../../bootstrap/container/useContainer.ts";

export function useCreateCompetition() {
  const container = useContainer();
  const queryClient = useQueryClient();

  return useMutation<CompetitionOverview, Error, NewCompetitionPayload>({
    // format / repulseByClub / repulseBySeed AREN'T FORWARDED: createCompetitionUseCase (AND
    // THE CORE DOMAIN IT BUILDS ON) HAS NO PLACE FOR THEM YET — SEE THE COMMENTS IN
    // new-competition-payload.interface.ts.
    mutationFn: (payload: NewCompetitionPayload) =>
      container.createCompetition({
        name: payload.name,
        place: payload.place,
        date: CompetitionDate.fromISO(payload.date),
      }),
    onSuccess: async () => {
      // REFETCHES THE LIST AFTER A SUCCESSFUL CREATE
      await queryClient.invalidateQueries({ queryKey: ["competition-list"] });
    },
  });
}
