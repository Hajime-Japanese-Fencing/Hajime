export function getRankBadgeClass(rank:number): string {
    switch (rank) {
        case 1:
            return "first"
        case 2:
            return "second"
        case 3:
            return "third"
        default:
            return ""
    }
}