import {
    CATALOG_ACTION,
    SetCatalogAction,
    EditProductDimensionsAction,
    UpdateCatalogProductsAction,
    SetWeeklySalesAction,
    SetBarcodeStatusesAction,
    UpdateBarcodeStatusAction,
    SetWeeklySalesButchAction,
    ProductSaleMap
} from "./catalog.types";
import { CatalogProduct, CatalogBarcode } from "shared/interfaces/models/CatalogProduct";
import { DimensionObject } from "../planogram/planogram.types";
import { BarcodeStatus } from "shared/interfaces/models/CatalogProduct";

export const setCatalog = (products: CatalogProduct[]): SetCatalogAction => (
    {
        type: CATALOG_ACTION.SET_CATALOG,
        products
    }
)
export const updateCatalogProducts = (products: CatalogProduct[]): UpdateCatalogProductsAction => (
    {
        type: CATALOG_ACTION.UPDATE_CATALOG_PRODUCTS,
        products
    }
)

export const editProductDimensions = (barcode: number, dimensions: DimensionObject): EditProductDimensionsAction => (
    {
        type: CATALOG_ACTION.EDIT_PRODUCT_DIMENSIONS,
        barcode,
        dimensions,
    }
)
export const setWeeklySale = (barcode: number, weekly: number | null): SetWeeklySalesAction => (
    {
        type: CATALOG_ACTION.SET_SALE_WEEKLY,
        barcode,
        weekly
    }
)
export const setWeeklySaleButch = (salesMap: ProductSaleMap): SetWeeklySalesButchAction => (
    {
        type: CATALOG_ACTION.SET_SALE_WEEKLY_BUTCH,
        salesMap
    }
)
export const setBarcodeStatuses = (statuses: BarcodeStatus[]): SetBarcodeStatusesAction => ({
    type: CATALOG_ACTION.SET_BARCODE_STATUSES,
    statuses
})
export const updateBarcodeStatus = (barcode: CatalogBarcode, message: string): UpdateBarcodeStatusAction => ({
    type: CATALOG_ACTION.EDIT_BARCODE_STATUS,
    barcode, message
})