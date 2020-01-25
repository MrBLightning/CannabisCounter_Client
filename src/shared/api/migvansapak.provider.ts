import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { MigvanSapak, Sapak, CatalogItem } from "shared/interfaces/models/SystemModels";

export async function getSapakim(): Promise<Sapak[]> {
    return await getRequest<Sapak[]>('/data/sapak');
}

export async function getCatalogItems(): Promise<CatalogItem[]> {
    return await getRequest<CatalogItem[]>('/data/catalogItem');
}

export async function getMigvanSapakim(): Promise<MigvanSapak[]> {
    return await getRequest<MigvanSapak[]>('/manage/migvanSapak');
}

export async function addMigvanSapak(SapakId: number, BarCode: number, Code: number, Main:number) {
    let record = {
        SapakId: SapakId,
        BarCode: BarCode,
        Code: Code,
        Main: Main
    };
    await postRequest('/manage/migvanSapak', { record });
}

export async function updateMigvanSapak(Id: number, SapakId: number, BarCode: number, Code: number, Main:number) {
    let record = {
        Id: Id,
        SapakId: SapakId,
        BarCode: BarCode,
        Code: Code,
        Main: Main
    };
    await putRequest('/manage/migvanSapak/' + Id, { record });
}

export async function deleteMigvanSapak(Id: number) {
    await deleteRequest('/manage/migvanSapak/' + Id);
}