import { PlanogramShelf } from "../planogram.types";

const heightSkip = 5;

const heightRound = (num: number): number => Math.ceil(num / heightSkip) * heightSkip;

export function heightPosition(num: number, height: number) {
    return heightRound(num) + "_" + heightRound(height);
}

export function calculateHeightPosition(shelves: PlanogramShelf[], positionIndex: number): string {
    let value = 0;
    for (let i = 0; i < positionIndex; i++)
        value += shelves[i].dimensions.height;
    return heightPosition(value, shelves[positionIndex].dimensions.height);
}