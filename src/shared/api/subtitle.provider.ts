import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { Yedm, Branch } from "shared/interfaces/models/SystemModels";


export async function getYedmItems(): Promise<Yedm[]> {
    return await getRequest<Yedm[]>('/data/subtitle');
}


export async function updateYedmItem(id: number, record: any) {

    await putRequest('/manage/subtitle/' + id, { record });
}


export async function deleteYedmItem(id: number) {

    await deleteRequest('/manage/subtitle/' + id);
}


export async function addYedmItem(record: any) {
    await postRequest('/manage/subtitle', { record });
}

export async function getBranches(): Promise<Branch[]> {
    return await getRequest<Branch[]>('/data/branch');
}