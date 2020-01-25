import { PlanogramShelf, PlanogramItem, PlacementObject, PlanogramElementId } from "../../planogram.types";
import { ITEM_ACTIONS, addItemActionType, duplicateItemActionType, deleteItemActionType, switchItemsActionType, EditItemActionType, moveItemActionType, } from "./item.types";
import { CatalogBarcode } from "shared/interfaces/models/CatalogProduct";

export function addProductAction(shelf: PlanogramElementId, product: CatalogBarcode, placement?: PlacementObject): addItemActionType {
    return {
        type: ITEM_ACTIONS.ADD_PRODUCT,
        shelf,
        product,
        placement
    }
}
export function duplicateItemAction(shelf: PlanogramElementId, item: PlanogramItem): duplicateItemActionType {
    return {
        type: ITEM_ACTIONS.DUPLICATE_ITEM,
        shelf,
        item
    }
}
export function moveShelfItem(shelf: PlanogramElementId, item: PlanogramElementId): moveItemActionType {
    return {
        type: ITEM_ACTIONS.MOVE_ITEM,
        shelf,
        item
    }
}
export function switchItemsAction(item: PlanogramElementId, remote: PlanogramElementId): switchItemsActionType {
    return {
        type: ITEM_ACTIONS.SWITCH_ITEMS,
        // shelf,
        item,
        remote
    }
}
export function deleteItemAction(shelf: PlanogramElementId, item: PlanogramElementId): deleteItemActionType {
    return {
        type: ITEM_ACTIONS.DELETE_ITEM,
        shelf,
        item
    }
}

export function editShelfItemAction(item: PlanogramElementId, placement: PlacementObject, barcode?: CatalogBarcode): EditItemActionType {
    console.log('editShelfItemAction',item,placement);
    return {
        type: ITEM_ACTIONS.EDIT_ITEM_PLACEMENT,
        // shelf,
        item,
        placement,
        barcode
    }
}