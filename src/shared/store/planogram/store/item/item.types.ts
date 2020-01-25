import { PlanogramItem, PlacementObject, PlanogramElementId } from "../../planogram.types";
import { CatalogBarcode } from "shared/interfaces/models/CatalogProduct";

export enum ITEM_ACTIONS {
    ADD_PRODUCT = 'ADD_PRODUCT',
    DELETE_ITEM = "DELETE_ITEM",
    DUPLICATE_ITEM = "DUPLICATE_ITEM",
    SWITCH_ITEMS = "SWITCH_ITEMS",
    EDIT_ITEM_PLACEMENT = "EDIT_ITEM_PLACEMENT",
    MOVE_ITEM = "MOVE_ITEM"
}

export type addItemActionType = {
    type: ITEM_ACTIONS.ADD_PRODUCT,
    shelf: PlanogramElementId,
    product: CatalogBarcode,
    placement?: PlacementObject
};
export type duplicateItemActionType = {
    type: ITEM_ACTIONS.DUPLICATE_ITEM,
    shelf: PlanogramElementId,
    item: PlanogramItem
};
export type moveItemActionType = {
    type: ITEM_ACTIONS.MOVE_ITEM,
    shelf: PlanogramElementId,
    item: PlanogramElementId
};
export type switchItemsActionType = {
    type: ITEM_ACTIONS.SWITCH_ITEMS,
    // shelf: PlanogramElementId,
    item: PlanogramElementId,
    remote: PlanogramElementId
};
export type deleteItemActionType = {
    type: ITEM_ACTIONS.DELETE_ITEM,
    shelf: PlanogramElementId,
    item: PlanogramElementId
};
export type EditItemActionType = {
    type: ITEM_ACTIONS.EDIT_ITEM_PLACEMENT,
    // shelf: PlanogramElementId,
    item: PlanogramElementId,
    placement: PlacementObject,
    barcode?: CatalogBarcode
};


export type ItemActionTypes = moveItemActionType | EditItemActionType | addItemActionType | duplicateItemActionType | deleteItemActionType | switchItemsActionType;
