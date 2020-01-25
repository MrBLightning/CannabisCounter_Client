import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { CatalogItem, Subbar } from "shared/interfaces/models/SystemModels";

export async function getCatalogItems(): Promise<CatalogItem[]> {
    return await getRequest<CatalogItem[]>('/data/catalogItem');
}

export async function getSubbars(): Promise<Subbar[]> {
    return await getRequest<Subbar[]>('/manage/subbar');
}

export async function addSubbar(Name: string, br1: number, br2: number, br3: number, br4: number,
    br5: number, br6: number, br7: number, br8: number, br9: number, br10: number) {
    let record = {
        Name: Name,
        br1: br1,
        br2: br2,
        br3: br3,
        br4: br4,
        br5: br5,
        br6: br6,
        br7: br7,
        br8: br8,
        br9: br9,
        br10: br10
    };
    await postRequest('/manage/subbar', { record });
}

export async function updateSubbar(Id: number, Name: string, br1: number, br2: number, br3: number, br4: number,
    br5: number, br6: number, br7: number, br8: number, br9: number, br10: number) {
    let record = {
        Id: Id,
        Name: Name,
        br1: br1,
        br2: br2,
        br3: br3,
        br4: br4,
        br5: br5,
        br6: br6,
        br7: br7,
        br8: br8,
        br9: br9,
        br10: br10
    };
    await putRequest('/manage/subbar/' + Id, { record });
}

export async function deleteSubbar(Id: number) {
    await deleteRequest('/manage/subbar/' + Id);
}