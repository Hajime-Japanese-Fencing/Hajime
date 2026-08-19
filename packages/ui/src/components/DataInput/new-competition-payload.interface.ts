// --- WHAT NewCompetition.vue EMITS ON SUBMIT — DELIBERATELY NOT A (PARTIAL) CompetitionOverview:
// id/status DON'T EXIST YET AT THIS POINT (MINTED LATER BY A core USE-CASE), AND date IS KEPT AS
// THE RAW STRING FROM THE NATIVE <input type="date"> RATHER THAN A CompetitionDate — THE CALLER
// CONVERTS VIA CompetitionDate.fromISO(...), KEEPING THIS DUMB COMPONENT FREE OF ANY DOMAIN
// CONSTRUCTION LOGIC. ---
export interface NewCompetitionPayload {
  name: string;
  place: string;
  date: string;
}
