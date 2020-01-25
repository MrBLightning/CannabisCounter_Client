import { FetchPlanogramStoreResponse } from "../interfaces/responses/PlanogramResponse";
import { DimensionObject, PlanogramStore, PlanogramElementId, PlacementObject, PlanogramAisle, ScateredDimensionObject } from "../store/planogram/planogram.types";
import { getRequest, putRequest, postRequest, deleteRequest } from "shared/http";
import { CatalogProduct, CatalogBarcode } from "shared/interfaces/models/CatalogProduct";
import { ProductWeekSales } from "../interfaces/responses/planogram.dto";
import { AisleId } from "shared/store/planogram/store/aisle/aisle.types";

export type PlanogramStoreRecord = {
    id: number,
    branch_id: number,
    priority: 0 | 1 | 2,
    name?: string,
    aisle_counter: number,
    version?: string
}
  

export const fetchStores = async (): Promise<PlanogramStoreRecord[]> => {
    const resp = await getRequest<{
        stores: PlanogramStoreRecord[]
    }>('planogram/stores');
    return resp.stores;
}
export const fetchBranchStores = async (branchId: number | string): Promise<PlanogramStoreRecord[]> => {
    const resp = await getRequest<{
        stores: PlanogramStoreRecord[]
    }>('planogram/' + branchId);
    return resp.stores;
}
export const productPredictedSales = async (barcode: CatalogBarcode, branch_id: string | number): Promise<ProductWeekSales | undefined> => {
    const resp = await getRequest<{
        status: "ok" | "empty",
        sale: ProductWeekSales,
    }>('planogram/sales/barcode', {
        params: {
            barcode,
            branch_id
        }
    });
    return resp.sale;
}
export const productsPredictedSales = async (branchId: number, barcodes: CatalogBarcode[]): Promise<ProductWeekSales[]> => {
    const resp = await postRequest<{ status: string, sales: ProductWeekSales[] }>('planogram/sales/batch', {
        branchId,
        barcodes
    });
    return resp.sales;
}

export const updateProductDimensions = async (barcode: number, dimensions: DimensionObject): Promise<void> => {
    await putRequest<any>('planogram/catalog/' + barcode, {
        barcode,
        dimensions
    });
}


export const fetchPlanogramStore = async (storeId: number | string): Promise<PlanogramStore> => {
    const resp = await getRequest<FetchPlanogramStoreResponse>('planogram/store/' + (storeId || ""));
    if (!resp.store) throw new Error("No store was found.");
    return resp.store;
}
export const createNewStore = async (branchId: number | string): Promise<PlanogramStore> => {
    const resp = await postRequest<{ status: string, store: PlanogramStore }>(`planogram/${branchId}/new`, {});
    return resp.store;
}
export const renameStore = async (storeId: number, name: string) => {
    await putRequest<{ status: string, store: PlanogramStore }>(`planogram/store/${storeId}/name`, {
        name
    });
}
export const savePlanogramStore = async (store: PlanogramStore): Promise<PlanogramStore> => {
    const resp = await postRequest<{ status: string, store: PlanogramStore }>('planogram/store/' + (store.store_id), {
        store
    });
    return resp.store;
}
export const deletePlanogramStore = async (storeId: number | string): Promise<void> => {
    await deleteRequest('planogram/store/' + storeId);
}
export const createStoreAisle = async (storeId: number | string): Promise<PlanogramAisle> => {
    const result = await getRequest<{ status: string, aisle: PlanogramAisle }>(`planogram/store/${storeId}/aisle/create`);
    return result.aisle;
}
export const deleteStoreAisle = async (storeId: number | string, aisleId: AisleId) => {
    await deleteRequest<{ status: string, message: string }>(`/planogram/store/${storeId}/aisle/${aisleId}`);
}
export const saveStoreAisle = async (storeId: number | string, aisle: PlanogramAisle): Promise<PlanogramAisle> => {
    const result = await postRequest<{
        status: string,
        aisle: PlanogramAisle
    }>(`/planogram/store/${storeId}/aisle/${aisle.aisle_id}`, {
        aisle
    });
    return result.aisle;
}
// export const deleteStoreAisle =
export type UpdateProductItem = {
    barcode?: number;
    dimensions: ScateredDimensionObject;
};
export const updateMultipleProductsDimensions = async (products: UpdateProductItem[]): Promise<CatalogProduct[]> => {
    return await postRequest<CatalogProduct[]>('planogram/catalog/dimensions', {
        products
    });
};



export const addShelfItem = async (storeId: number, shelf_id: PlanogramElementId, barcode: string | CatalogBarcode, placement: PlacementObject, previous_barcode?: string | CatalogBarcode) => {
    await postRequest(`planogram/store/${storeId}/item`, {
        shelf_id,
        barcode,
        placement,
        previous_barcode
    });
}
export const updateShelfItem = async (storeId: number, item_id: PlanogramElementId, shelf_id: PlanogramElementId, placement: PlacementObject, barcode?: string | CatalogBarcode) => {
    await putRequest(`planogram/store/${storeId}/item/${item_id}`, {
        shelf_id,
        item_id,
        placement,
        barcode
    });
}
export const deleteShelfItem = async (storeId: number, shelfItem: PlanogramElementId) => {
    await deleteRequest(`planogram/store/${storeId}/item/${shelfItem}`, {});
}


export const duplciateAisle = async (branchId: number, storeId: number | null, aisleId: string | number, targetStoreId: string | number) => {
    return await postRequest('planogram/store/aisle/duplicate', {
        branch_id: branchId,
        store_id: storeId,
        source_aisle_pid: aisleId,
        target_store_id: targetStoreId
    });
}