import { PlanogramItem } from "../planogram.types";

export type ProductDetailPostion = {
    aisle_id: number,
    section: string,
    shelf: string,
    itemIndex: number
};

export type ProductDetailItem = {
    maxAmount: number,
    facesCount: number,
    position: ProductDetailPostion[]
}

export type ProductDetailState = {
    [key: number]: ProductDetailItem,
}

export enum PRODUCT_DETAIL_ACTION {
    ADD_ITEM = "ADD_ITEM"
}

export interface ProductDetailAddItem {
    type: PRODUCT_DETAIL_ACTION,
    item: PlanogramItem,
    barcode: number
}

export type ProductDetailActions = ProductDetailAddItem;