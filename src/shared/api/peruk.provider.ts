import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { Peruk, CatalogItem } from "shared/interfaces/models/SystemModels";

export async function getCatalogItems(): Promise<CatalogItem[]> {
    return await getRequest<CatalogItem[]>('/data/catalogItem');
}

export async function getPeruks(): Promise<Peruk[]> {
    return await getRequest<Peruk[]>('/manage/peruk');
}

export async function getPerukByLevel(Level: number): Promise<Peruk[]> {
    return await getRequest<Peruk[]>('/manage/peruk/' + Level);
}

export async function addPeruk(BarCodeParent:number, BarCodeChild:number, Remark:string, Level:string, Percent:number) {
    let record = {
        BarCodeParent: BarCodeParent,
        BarCodeChild: BarCodeChild,
        Remark: Remark,
        Level: Level,
        Percent: Percent
    };
    await postRequest('/manage/peruk', { record });
}

export async function updatePeruk(Id: number, BarCodeParent:number, BarCodeChild:number, Remark:string, Level:string, Percent:number) {
    let record = {
        Id: Id,
        BarCodeParent: BarCodeParent,
        BarCodeChild: BarCodeChild,
        Remark: Remark,
        Level: Level,
        Percent: Percent
    };
    await putRequest('/manage/peruk/' + Id, { record });
}

export async function deletePeruk(Id: number) {
    await deleteRequest('/manage/peruk/' + Id);
}