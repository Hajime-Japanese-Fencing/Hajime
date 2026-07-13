export interface Fighter {
    id: string,
    isSeriesHead: boolean,
    club: string,
}

export function createFighter(id: string, isSeriesHead: boolean, club: string): Fighter {
    return {
        id: id,
        isSeriesHead: isSeriesHead,
        club: club
    }
}

export class fighterBuilder implements Fighter{
    id: string = "1"
    isSeriesHead: boolean = false
    club: string = "club A"

    public createFighter(): fighterBuilder {
        return this
    }

    public withId(newId: string): fighterBuilder {
        this.id = newId
        return this
    }

    public withIsSeriesHead(newValue: boolean): fighterBuilder {
        this.isSeriesHead = newValue
        return this
    }

    public withClub(newClub: string): fighterBuilder {
        this.club = newClub
        return this
    }

    public toFighter(): Fighter {
        return {
            id: this.id,
            isSeriesHead: this.isSeriesHead,
            club: this.club
        }
    }



}