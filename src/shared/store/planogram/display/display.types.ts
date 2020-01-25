import { CatalogBarcode } from "shared/interfaces/models/CatalogProduct";

export type PlanogramDisplayColorBy = "supplier" | null;

export type PlanogramDisplayState = {
    aisleIndex: number,
    hideShelfItems: boolean,
    showRowItems: boolean,
    showSettings: boolean,
    markBadProducts: boolean,
    displaySalesReport: boolean,
    productDetailer: CatalogBarcode | null,
    colorBy: PlanogramDisplayColorBy
};