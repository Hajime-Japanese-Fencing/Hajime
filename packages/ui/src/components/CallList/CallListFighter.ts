import type { Rank } from "@hajime/core";

export interface CallListFighter {
  isPresent: boolean;
  name: string;
  licenseNumber: string;
  birthdate: string;
  rank: Rank;
  club: string;
}

export class CallListFighterBuilder {
  private isPresent: boolean = true;
  private name: string = "Ken Doe";
  private licenseNumber: string = "00000000";
  private birthdate: string = "2000-01-01";
  private rank: Rank = "10th kyu";
  private club: string = "Unknown Club";

  withPresent(isPresent: boolean): this {
    this.isPresent = isPresent;
    return this;
  }

  withName(name: string): this {
    this.name = name;
    return this;
  }

  withLicenseNumber(licenseNumber: string): this {
    this.licenseNumber = licenseNumber;
    return this;
  }

  withBirthdate(birthdate: string): this {
    this.birthdate = birthdate;
    return this;
  }

  withRank(rank: Rank): this {
    this.rank = rank;
    return this;
  }

  withClub(club: string): this {
    this.club = club;
    return this;
  }

  build(): CallListFighter {
    return {
      isPresent: this.isPresent,
      name: this.name,
      licenseNumber: this.licenseNumber,
      birthdate: this.birthdate,
      rank: this.rank,
      club: this.club,
    };
  }
}
