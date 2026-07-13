export class CompetitionDate {
  private constructor(private readonly value: Date) {}

  static fromISO(isoDate: string): CompetitionDate {
    return new CompetitionDate(new Date(isoDate));
  }

  static fromDate(date: Date): CompetitionDate {
    return new CompetitionDate(date);
  }

  toISOString(): string {
    return this.value.toISOString();
  }

  toHumanString(locale = "en-US"): string {
    return this.value.toLocaleDateString(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}
