import { SetLoadingActionType, SetDisplayAisleActionType, PLANOGRAM_ACTIONS, SetDisplayBranchActionType, SetProductDetailerActionType, HideProductDetailerActionType, ToggleRowItemsAction, ToggleSettingsAction, SetColorBy } from "./planogram.types";
import { CatalogBarcode } from "shared/interfaces/models/CatalogProduct";
import { PlanogramDisplayColorBy } from "./display/display.types";


export function setPlanogramLoading(state: boolean): SetLoadingActionType {
    return {
        type: PLANOGRAM_ACTIONS.SET_LOADING,
        isLoading: state
    }
}
export function setDisplayAisle(aisleIndex: number): SetDisplayAisleActionType {
    return {
        type: PLANOGRAM_ACTIONS.SET_DISPLAY_AISLE,
        aisleIndex
    }
}
export function setDisplayBranch(branchId: number): SetDisplayBranchActionType {
    return {
        type: PLANOGRAM_ACTIONS.SET_DISPLAY_BRANCH,
        branchId
    }
}
export function setProductDetailer(barcode: CatalogBarcode): SetProductDetailerActionType {
    return {
        type: PLANOGRAM_ACTIONS.SET_PRODUCT_DETAILER,
        barcode
    }
}
export function hideProductDetailer(): HideProductDetailerActionType {
    return {
        type: PLANOGRAM_ACTIONS.HIDE_PRODUCT_DETAILER,
    }
}
export function toggleRowItems(): ToggleRowItemsAction {
    return {
        type: PLANOGRAM_ACTIONS.TOGGLE_ROW_ITEMS,
    }
}
export function toggleSettings(): ToggleSettingsAction {
    return {
        type: PLANOGRAM_ACTIONS.TOGGLE_SETTINGS,
    }
}
export function setColorBy(color_by: PlanogramDisplayColorBy): SetColorBy {
    return {
        type: PLANOGRAM_ACTIONS.COLOR_BY,
        color_by
    }
}