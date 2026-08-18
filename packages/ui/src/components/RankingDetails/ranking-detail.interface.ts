export interface RankingDetail {
  poolRank: number;
  fighterName: string;
  points: number;
  nbVictories: number;
  nbGivenIppons: number;
  nbReceivedIppons: number;
}

export class RankingDetailBuilder implements RankingDetail {
  fighterName: string = "Unknown fighter";
  nbGivenIppons: number = 0;
  nbReceivedIppons: number = 0;
  nbVictories: number = 0;
  points: number = 0;
  poolRank: number = 1;

  public build(): RankingDetail {
    return {
      fighterName: this.fighterName,
      nbGivenIppons: this.nbGivenIppons,
      nbReceivedIppons: this.nbReceivedIppons,
      nbVictories: this.nbVictories,
      points: this.points,
      poolRank: this.poolRank,
    };
  }

  public withName(name: string): this {
    this.fighterName = name;
    return this;
  }
}
