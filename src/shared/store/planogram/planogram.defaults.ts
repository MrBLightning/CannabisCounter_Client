import { DimensionObject, PlacementObject } from "./planogram.types";

export enum PLANOGRAM_ID {
    AISLE = "A",
    SECTION = "SE",
    SHELF = "SH",
    ITEM = "I",
    PRODUCT = "P",
}

export const AisleDefaultDimension: DimensionObject = {
    height: 400,
    width: 5000,
    depth: 450
}
export const SectionDefaultDimension: DimensionObject = {
    height: 2000,
    width: 1000,
    depth: 450
}
export const SectionMaxDimension: DimensionObject = {
    height: 5000,
    width: 3000,
    depth: 1500
}
export const ShelfDefaultDimension: DimensionObject = {
    height: 400,
    width: 1000,
    depth: 450
}

export const ItemDefualtPlacement: PlacementObject = {
    faces: 1,
    row: 1,
    stack: 1,
    manual_row_only: 0
}
export const ItemMaxPlacement: PlacementObject = {
    faces: 30,
    row: 30,
    stack: 10,
    manual_row_only: 0
}
export const ProductDefaultDimensions: DimensionObject = {
    height: 150,
    width: 150,
    depth: 150
}