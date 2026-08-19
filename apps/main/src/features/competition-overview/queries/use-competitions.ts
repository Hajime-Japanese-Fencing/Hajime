import { useQuery } from "@tanstack/vue-query";
import type { CompetitionOverview } from "@hajime/core";
import { useContainer } from "../../../bootstrap/container/useContainer.ts";

export function useCompetitions() {
  const { retrieveCompetitions } = useContainer();
  return useQuery<CompetitionOverview[]>({
    queryKey: ["competition-list"],
    queryFn: () => retrieveCompetitions.retrieveAll(),
  });
}
