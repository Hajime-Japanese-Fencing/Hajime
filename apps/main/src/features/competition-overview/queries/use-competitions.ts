import { useQuery } from "@tanstack/vue-query";
import type { CompetitionOverview, RetrieveCompetitionsQuery } from "@hajime/core";

export function useCompetitions(query: RetrieveCompetitionsQuery) {
  return useQuery<CompetitionOverview[]>({
    queryKey: ["competition-list"],
    queryFn: () => query.retrieveAll(),
  });
}
