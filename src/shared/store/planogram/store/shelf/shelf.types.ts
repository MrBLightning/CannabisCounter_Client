import { DimensionObject, PlanogramItem, PlanogramSection, PlanogramShelf, PlanogramElementId } from "../../planogram.types";
import { CatalogBarcode } from "shared/interfaces/models/CatalogProduct";

export enum SHELF_ACTIONS {
    ADD_SHELF = 'ADD_SHELF',
    DUPLICATE_SHELF = 'DUPLICATE_SHELF',
    DELETE_SHELF = "DELETE_SHELF",
    SWITCH_SHELVES = "SWITCH_SHELVES",
    EDIT_SHELF_DIMENSIONS = "EDIT_SHELF_DIMENSIONS"
}

export type addShelfActionProps = {
    dimensions: DimensionObject,
    product?: CatalogBarcode,
    item?: PlanogramItem
};
export type addShelfActionType = {
    type: SHELF_ACTIONS.ADD_SHELF,
    section: PlanogramSection,
    dimensions?: DimensionObject,
    product?: CatalogBarcode,
    item?: PlanogramItem,
};
export type duplicateShelfActionType = {
    type: SHELF_ACTIONS.DUPLICATE_SHELF,
    section: PlanogramSection,
    shelf: PlanogramShelf
};
export type switchShelvesActionType = {
    type: SHELF_ACTIONS.SWITCH_SHELVES,
    // section: PlanogramSection,
    shelf: PlanogramElementId,
    remote: PlanogramElementId,
};
export type deleteShelfActionType = {
    type: SHELF_ACTIONS.DELETE_SHELF,
    section: PlanogramSection,
    shelf: PlanogramElementId
};
export type editShelfDimensionsActionType = {
    type: SHELF_ACTIONS.EDIT_SHELF_DIMENSIONS,
    shelf: PlanogramElementId,
    dimensions: DimensionObject,
};


export type ShelfActionTypes = editShelfDimensionsActionType | addShelfActionType | duplicateShelfActionType | deleteShelfActionType | switchShelvesActionType;
