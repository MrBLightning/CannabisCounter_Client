import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { SingleSupplierItem, CatalogItem, Sapak } from "shared/interfaces/models/SystemModels";

export async function getItems(): Promise<CatalogItem[]> {
    return await getRequest<CatalogItem[]>('/data/catalogItem');
}

export async function getSuppliers(): Promise<Sapak[]> {
    return await getRequest<Sapak[]>('/data/sapak');
}

export async function getSingleSupplierItems(): Promise<SingleSupplierItem[]> {
    return await getRequest<SingleSupplierItem[]>('/manage/singleSupplierItem');
}

export async function addSingleSupplierItem(BarCode: number, SupplierId: number) {
    let record = {
        BarCode: BarCode,
        SupplierId: SupplierId
    };
    await postRequest('/manage/singleSupplierItem', { record });
}

export async function updateSingleSupplierItem(Id:number, BarCode: number, SupplierId: number) {
    let record = {
        Id:Id,
        BarCode: BarCode,
        SupplierId: SupplierId
    };    
    await putRequest('/manage/SingleSupplierItem/' + Id, { record });
}

export async function deleteSingleSupplierItem(Id:number) {
    await deleteRequest('/manage/SingleSupplierItem/' + Id);
}

