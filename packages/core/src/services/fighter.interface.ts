export interface Fighter {
  id: string;
  isSeriesHead: boolean;
  club: string;
}

export function createFighter(
  id: string = "XXX",
  isSeriesHead: boolean = false,
  club: string = "",
): Fighter {
  return {
    id: id,
    isSeriesHead: isSeriesHead,
    club: club,
  };
}
