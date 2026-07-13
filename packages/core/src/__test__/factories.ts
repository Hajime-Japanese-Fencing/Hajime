import type { Fighter } from "../services/fighter.interface.ts";

export function fighterFactory(fighter: Partial<Fighter>): Fighter {
  return {
    id: "1",
    isSeriesHead: false,
    club: "Club A",
    ...fighter,
  };
}

// export class FighterBuilder {
//     fighter: Fighter = {
//         id: "1",
//         isSeriesHead: false,
//         club: "Club A"
//     }

//     public createFighter(): FighterBuilder {
//         return this
//     }

//     public withId(newId: string): FighterBuilder {
//         this.fighter = {
//             ...this.fighter,
//             id: newId
//         }
//         return this
//     }

//     public withIsSeriesHead(newValue: boolean): FighterBuilder {

//         return this
//     }

//     public withClub(newClub: string): FighterBuilder {
//         this.fighter = {
//             ...this.fighter,
//             club: newClub
//         }
//         return this
//     }

//     public build(): Fighter {
//         return this.fighter
//     }
// }
