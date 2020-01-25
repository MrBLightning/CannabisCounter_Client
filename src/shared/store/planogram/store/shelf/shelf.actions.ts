import { PlanogramSection, PlanogramShelf, DimensionObject, PlanogramElementId } from "../../planogram.types";
import { SHELF_ACTIONS, addShelfActionType, duplicateShelfActionType, deleteShelfActionType, switchShelvesActionType, addShelfActionProps, editShelfDimensionsActionType } from "./shelf.types";


export function addShelfAction(section: PlanogramSection, data?: addShelfActionProps): addShelfActionType {
    return {
        type: SHELF_ACTIONS.ADD_SHELF,
        section,
        ...data
        // product_duplicate: product
    }
}
export function duplicateShelfAction(section: PlanogramSection, shelf: PlanogramShelf): duplicateShelfActionType {
    return {
        type: SHELF_ACTIONS.DUPLICATE_SHELF,
        section,
        shelf
    }
}
export function switchShelvesAction(shelf: PlanogramElementId, remote: PlanogramElementId): switchShelvesActionType {
    return {
        type: SHELF_ACTIONS.SWITCH_SHELVES,
        // section,
        shelf,
        remote
    }
}
export function deleteShelfAction(section: PlanogramSection, shelf: PlanogramElementId): deleteShelfActionType {
    return {
        type: SHELF_ACTIONS.DELETE_SHELF,
        section,
        shelf
    }
}
export function editShelfDimensionsAction(shelf: PlanogramElementId, dimensions: DimensionObject): editShelfDimensionsActionType {
    return {
        type: SHELF_ACTIONS.EDIT_SHELF_DIMENSIONS,
        dimensions,
        shelf
    }
}