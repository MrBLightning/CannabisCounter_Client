import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { YedionType, Yeds, Yedm, Yedmivs, Yedtzs, CatalogItem, Degem,Sapak } from "shared/interfaces/models/SystemModels";


export async function getYedion(): Promise<YedionType[]> {
    return await getRequest<YedionType[]>('/data/yedion');
}

export async function getYedItems(): Promise<Yeds[]> {
    return await getRequest<Yeds[]>('/data/yed');
}


export async function updateYedionItem(id: number, record: any) {
    await putRequest('/manage/yedion/' + id, { record });
}


export async function deleteYedion(id: number) {

    await deleteRequest('/manage/yedion/' + id);
}


export async function addYedionItem(record: any) {
    
    await postRequest('/manage/yedion', { record });
}


export async function getYedmItems(): Promise<Yedm[]> {
    return await getRequest<Yedm[]>('/data/subtitle');
}


export async function getYedmivItems(): Promise<Yedmivs[]> {
    return await getRequest<Yedmivs[]>('/data/yedmiv');
}

export async function getYedtzItems(): Promise<Yedtzs[]> {
    return await getRequest<Yedtzs[]>('/data/yedtz');
}

export async function getCatalogItems(): Promise<CatalogItem[]> {
    return await getRequest<CatalogItem[]>('/data/catalogItem');
}

export async function getDegemItems(): Promise<Degem[]> {
    return await getRequest<Degem[]>('/data/degem');
}

export async function getSapakItems(): Promise<Sapak[]> {
    return await getRequest<Sapak[]>('/data/sapak');
}