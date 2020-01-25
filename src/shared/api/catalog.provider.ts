import { CatalogProduct, CatalogBarcode } from "shared/interfaces/models/CatalogProduct";
import { getRequest, putRequest } from "shared/http";
import { BarcodeStatus } from "shared/interfaces/models/CatalogProduct";
import { DimensionObject } from "shared/store/planogram/planogram.types";

export const fetchCatalog = async (): Promise<CatalogProduct[]> => {
    return await getRequest<CatalogProduct[]>('planogram/catalog');
}
export const fetchBarcodeStatuses = async (): Promise<BarcodeStatus[]> => {
    return await getRequest<BarcodeStatus[]>('planogram/barcode/statuses');
}
export const updateBarcodeStatus = async (barcode: CatalogBarcode, message: string): Promise<void> => {
    return await putRequest('planogram/barcode/status/' + barcode, {
        message
    });
}
export const fetchCatalogByBarCode = async (barcode: number): Promise<CatalogProduct[]> => {
    return await getRequest<CatalogProduct[]>('planogram/catalog/' + barcode);
}
export const updateBarCodeDimensions = async (barcode: number,dimensions:DimensionObject): Promise<void> => {
    return await putRequest('planogram/catalog/' + barcode,{ dimensions });
}
export const fetchCatalogByDegem = async (degemId: number): Promise<CatalogProduct[]> => {
    return await getRequest<CatalogProduct[]>('planogram/degem/' + degemId);
}
