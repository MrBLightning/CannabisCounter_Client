import { CatalogProduct, CatalogBarcode } from "shared/interfaces/models/CatalogProduct";
import { DimensionObject } from "../planogram/planogram.types";
import { BarcodeStatus } from "shared/interfaces/models/CatalogProduct";

export type ProductSaleMapItem = {
    weekly: number | null,
    monthly: number | null,
}
export type ProductSaleMap = {
    [key: number]: ProductSaleMapItem
}

export type CatalogMap = { [key: string]: CatalogProduct };

export type CatalogState = {
    products: CatalogProduct[],
    productsMap: CatalogMap,
    productSales: ProductSaleMap,
    barcodeStatusMap: { [key: number]: BarcodeStatus },
}

export enum CATALOG_ACTION {
    SET_CATALOG = "SET_CATALOG",
    EDIT_PRODUCT_DIMENSIONS = "EDIT_PRODUCT_DIMENSIONS",
    UPDATE_CATALOG_PRODUCTS = "UPDATE_CATALOG_PRODUCTS",
    SET_SALE_WEEKLY = "SET_BARCODE_SALE",
    SET_BARCODE_STATUSES = "SET_BARCODE_STATUSES",
    EDIT_BARCODE_STATUS = "EDIT_BARCODE_STATUS",
    SET_SALE_WEEKLY_BUTCH = "SET_SALE_WEEKLY_BUTCH"
}

export interface SetCatalogAction {
    type: CATALOG_ACTION.SET_CATALOG,
    products: CatalogProduct[]
}
export interface UpdateCatalogProductsAction {
    type: CATALOG_ACTION.UPDATE_CATALOG_PRODUCTS,
    products: CatalogProduct[]
}
export interface EditProductDimensionsAction {
    type: CATALOG_ACTION.EDIT_PRODUCT_DIMENSIONS,
    barcode: number,
    dimensions: DimensionObject
}
export interface SetWeeklySalesAction {
    type: CATALOG_ACTION.SET_SALE_WEEKLY,
    barcode: number,
    weekly: number | null,
}
export interface SetWeeklySalesButchAction {
    type: CATALOG_ACTION.SET_SALE_WEEKLY_BUTCH,
    salesMap: ProductSaleMap
}
export interface SetBarcodeStatusesAction {
    type: CATALOG_ACTION.SET_BARCODE_STATUSES,
    statuses: BarcodeStatus[],
}
export interface UpdateBarcodeStatusAction {
    type: CATALOG_ACTION.EDIT_BARCODE_STATUS,
    barcode: CatalogBarcode,
    message: string,
}

export type CatalogActions = SetCatalogAction | SetWeeklySalesButchAction | UpdateBarcodeStatusAction | SetBarcodeStatusesAction | UpdateCatalogProductsAction | EditProductDimensionsAction | SetWeeklySalesAction