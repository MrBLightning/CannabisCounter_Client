import { PlanogramViewState, PlanogramViewActionTypes } from "./store/store.types";
import { PlanogramSidebarState, PlanogramSidebarActionTypes } from "./sidebar/sidebar.types";
import { AisleActionTypes } from "./store/aisle/aisle.types";
import { SectionActionTypes } from "./store/section/section.types";
import { ShelfActionTypes } from "./store/shelf/shelf.types";
import { ItemActionTypes } from "./store/item/item.types";
import { VirtualStoreState } from "./virtualize/virtualize.reducer";
import { CatalogBarcode } from "shared/interfaces/models/CatalogProduct";
import { PlanogramDisplayState, PlanogramDisplayColorBy } from "./display/display.types";
import { ProductDetailState, ProductDetailActions } from "./product-details/product-details.type";

export enum SHELF_TYPE {
    SINGLE = "SINGLE",
    COMBINED = "COMBINED"
}

// export namespace Planogram {
export type PlanogramElementId = string;
export type PlanogramElement = {
    id: PlanogramElementId,
    dimensions: DimensionObject,
    name?: string
}
export interface DimensionObject {
    width: number,
    height: number,
    depth: number,
    weight?:number,
}
export interface ScateredDimensionObject {
    width?: number,
    height?: number,
    depth?: number,
    weight?:number,
}
export interface PlacementObject {
    faces: number,
    stack: number,
    row: number,
    manual_row_only: number // 0 (regular calculation of row) or 1 (only user input can change the row)
}

export type PlanogramStore = {
    store_id: number,
    name?: string,
    branch_id: number,
    aisle_counter: number,
    aisles: PlanogramAisle[]
}

export interface PlanogramAisle extends PlanogramElement {
    aisle_id: number,
    index: number,
    aisle_number: number,
    name: string,
    sections: PlanogramSection[]
}

export interface PlanogramSection extends PlanogramElement {
    section_id?: number,
    shelves: PlanogramShelf[]
}

export interface PlanogramShelf extends PlanogramElement {
    type?: SHELF_TYPE.SINGLE,
    // shelf_id?: number,
    items: PlanogramItem[],
    // height_position: string | null,
    section_height: number | null,
    margin_bottom: number | null,
    offset?: number,
}
export interface PlanogramCombinedShelf extends PlanogramElement {
    type: SHELF_TYPE.COMBINED,
    shelves: PlanogramShelf[]
}

export interface PlanogramItem {
    id: PlanogramElementId,
    // item_id?: number,
    placement: PlacementObject,
    product: CatalogBarcode
}
// export type PlanogramProduct = number;
export interface PlanogramSidebarProduct {
    id: number,
    barcode: number,
    name: string,
    dimensions: ScateredDimensionObject
}
// }

export interface PlanogramState {
    display: PlanogramDisplayState,
    store: PlanogramViewState,
    // storeList: any[],
    sidebar: PlanogramSidebarState,
    productDetails: ProductDetailState,
    virtualStore: VirtualStoreState
}

export enum PLANOGRAM_ACTIONS {
    DONE_LOADING = 'DONE_LOADING',
    SET_LOADING = "SET_LOADING",
    SET_DISPLAY_AISLE = "SET_DISPLAY_AISLE",
    SET_DISPLAY_BRANCH = "SET_DISPLAY_BRANCH",
    SET_PRODUCT_DETAILER = "SET_PRODUCT_DETAILER",
    HIDE_PRODUCT_DETAILER = "HIDE_PRODUCT_DETAILER",
    SHOW_SALES_REPORT = "SHOW_SALES_REPORT",
    HIDE_SALES_REPORT = "HIDE_SALES_REPORT",
    TOGGLE_SHELF_ITEMS = "TOGGLE_SHELF_ITEMS",
    TOGGLE_ROW_ITEMS = "TOGGLE_ROW_ITEMS",
    TOGGLE_SETTINGS = "TOGGLE_SETTINGS",
    TOGGLE_BAD_PRODUCTS_MARKER = "TOGGLE_BAD_PRODUCTS_MARKER",
    COLOR_BY = "COLOR_BY"
}
export type SetLoadingActionType = { type: PLANOGRAM_ACTIONS.SET_LOADING, isLoading: boolean, };
export type SetDisplayAisleActionType = { type: PLANOGRAM_ACTIONS.SET_DISPLAY_AISLE, aisleIndex: number };
export type SetDisplayBranchActionType = { type: PLANOGRAM_ACTIONS.SET_DISPLAY_BRANCH, branchId: number };
export type SetProductDetailerActionType = { type: PLANOGRAM_ACTIONS.SET_PRODUCT_DETAILER, barcode: CatalogBarcode };
export type HideProductDetailerActionType = { type: PLANOGRAM_ACTIONS.HIDE_PRODUCT_DETAILER };
export type ShowSalesReportAction = { type: PLANOGRAM_ACTIONS.SHOW_SALES_REPORT };
export type HideSalesReportAction = { type: PLANOGRAM_ACTIONS.HIDE_SALES_REPORT };
export type ToggleShelfItemsAction = { type: PLANOGRAM_ACTIONS.TOGGLE_SHELF_ITEMS };
export type ToggleRowItemsAction = { type: PLANOGRAM_ACTIONS.TOGGLE_ROW_ITEMS };
export type ToggleSettingsAction = { type: PLANOGRAM_ACTIONS.TOGGLE_SETTINGS };
export type ToggleBadProductsMarkerAction = { type: PLANOGRAM_ACTIONS.TOGGLE_BAD_PRODUCTS_MARKER };
export type SetColorBy = { 
    type: PLANOGRAM_ACTIONS.COLOR_BY,
    color_by: PlanogramDisplayColorBy
};


export type PlanogramStoreAction = SetColorBy | ToggleRowItemsAction | AisleActionTypes | SectionActionTypes | ShelfActionTypes | ItemActionTypes;
export type PlanogramActions = ToggleBadProductsMarkerAction | ToggleSettingsAction | ToggleShelfItemsAction | ShowSalesReportAction | HideSalesReportAction | SetDisplayAisleActionType | HideProductDetailerActionType | SetProductDetailerActionType | SetDisplayBranchActionType | SetLoadingActionType | PlanogramStoreAction | PlanogramViewActionTypes | ProductDetailActions | PlanogramSidebarActionTypes;