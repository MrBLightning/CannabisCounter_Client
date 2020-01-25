import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { Subgroup, Group } from "shared/interfaces/models/SystemModels";

export async function getGroups(): Promise<Group[]> {
    return await getRequest<Group[]>('/data/group');
}

export async function getSubgroups(): Promise<Subgroup[]> {
    return await getRequest<Subgroup[]>('/manage/subgroup');
}

export async function addSubgroup(Id: number, Name: string, GroupId: number) {
    let record = {
        Id: Id,
        Name: Name,
        GroupId: GroupId
    };
    await postRequest('/manage/subgroup', { record });
}

export async function updateSubgroup(Id: number, Name: string, GroupId: number) {
    let record = {
        Id: Id,
        Name: Name,
        GroupId: GroupId
    };
    await putRequest('/manage/subgroup/' + Id, { record });
}

export async function deleteSubgroup(Id: number) {
    await deleteRequest('/manage/subgroup/' + Id);
}

