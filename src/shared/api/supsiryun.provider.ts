import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { Supsiryun, Group, Sapak, Scrmenu } from "shared/interfaces/models/SystemModels";

export async function getGroups(): Promise<Group[]> {
    return await getRequest<Group[]>('/data/group');
}

export async function getSapaks(): Promise<Sapak[]> {
    return await getRequest<Sapak[]>('/data/sapak');
}

export async function getScrmenus(): Promise<Scrmenu[]> {
    return await getRequest<Scrmenu[]>('/data/scrmenu');
}

export async function getSupsiryuns(): Promise<Supsiryun[]> {
    return await getRequest<Supsiryun[]>('/manage/supsiryun');
}

export async function addSupsiryun(SapakId: number, GroupId: number, ScrId: number, Place: number) {
    let record = {
        SapakId: SapakId,
        GroupId: GroupId,
        ScrId: ScrId,
        Place: Place
    }
    await postRequest('/manage/supsiryun', { record });
}

export async function updateSupsiryun(Id: number, SapakId: number, GroupId: number, ScrId: number, Place: number) {
    let record = {
        Id: Id,
        SapakId: SapakId,
        GroupId: GroupId,
        ScrId: ScrId,
        Place: Place
    };    
    await putRequest('/manage/supsiryun/' + Id, { record });
}

export async function deleteSupsiryun(Id:number) {
    await deleteRequest('/manage/supsiryun/' + Id);
}

