import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { CannabisItem } from "shared/interfaces/models/SystemModels";

export async function getCannabisItems(): Promise<CannabisItem[]> {
    return await getRequest<CannabisItem[]>('/manage/item');
}

export async function addCannabisItem(BarCode: number, Name: string, THC: number, CBD: number) {
    let record = {
        BarCode: BarCode, 
        Name: Name,
        THC: THC,
        CBD: CBD
    };
    await postRequest('/manage/item', { record });
}

export async function updateCannabisItem(Id: number, BarCode: number, Name: string, THC: number, CBD: number) {
    let record = {
        Id: Id, 
        BarCode: BarCode, 
        Name: Name,
        THC: THC,
        CBD: CBD
    };
    await putRequest('/manage/item/' + Id, { record });
}

export async function deleteCannabisItem(Id:number) {
    await deleteRequest('/manage/item/' + Id);
}

