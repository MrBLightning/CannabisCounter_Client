import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { MigvanBranch, Branch, CatalogItem } from "shared/interfaces/models/SystemModels";

export async function getBranches(): Promise<Branch[]> {
    return await getRequest<Branch[]>('/data/branch');
}

export async function getCatalogItems(): Promise<CatalogItem[]> {
    return await getRequest<CatalogItem[]>('/data/catalogItem');
}

export async function getMigvanBranches(): Promise<MigvanBranch[]> {
    return await getRequest<MigvanBranch[]>('/manage/migvanBranch');
}

export async function addMigvanBranch(BranchId: number, BarCode: number) {
    let record = {
        BranchId: BranchId,
        BarCode: BarCode
    };
    await postRequest('/manage/migvanBranch', { record });
}

export async function updateMigvanBranch(Id: number, BranchId: number, BarCode: number) {
    let record = {
        Id: Id,
        BranchId: BranchId,
        BarCode: BarCode
    };
    await putRequest('/manage/migvanBranch/' + Id, { record });
}

export async function deleteMigvanBranch(Id: number) {
    await deleteRequest('/manage/migvanBranch/' + Id);
}