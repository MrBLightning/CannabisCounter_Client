import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { CatalogItem, Branch, Dorder } from "shared/interfaces/models/SystemModels";

export async function getItems(): Promise<CatalogItem[]> {
    return await getRequest<CatalogItem[]>('/manage/item');
}

export async function getBranches(): Promise<Branch[]> {
    return await getRequest<Branch[]>('/data/branch');
}

export async function getDorders(): Promise<Dorder[]> {
    return await getRequest<Dorder[]>('/manage/dorder');
}

export async function addDorder(BranchId: number, BarCode: number, d1: number | null, d2: number | null,
    d3: number | null, d4: number | null, d5: number | null, d6: number | null, d7: number | null) {
    let record = {
        BranchId: BranchId,
        BarCode:BarCode,
        d1: d1,
        d2: d2,
        d3: d3,
        d4: d4,
        d5: d5,
        d6: d6,
        d7: d7
    };
    await postRequest('/manage/dorder', { record });
}

export async function updateDorder(Id:number,BranchId: number, BarCode: number, d1: number | null, d2: number | null,
    d3: number | null, d4: number | null, d5: number | null, d6: number | null, d7: number | null) {
    let record = {
        Id: Id,
        BranchId: BranchId,
        BarCode:BarCode,
        d1: d1,
        d2: d2,
        d3: d3,
        d4: d4,
        d5: d5,
        d6: d6,
        d7: d7
    };
    await putRequest('/manage/dorder/' + Id, { record });
}

export async function deleteDorder(Id: number) {
    await deleteRequest('/manage/dorder/' + Id);
}

