import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { Group, Department } from "shared/interfaces/models/SystemModels";

export async function getDepartments(): Promise<Department[]> {
    return await getRequest<Department[]>('/data/department');
}

export async function getGroups(): Promise<Group[]> {
    return await getRequest<Group[]>('/manage/group');
}

export async function addGroup(Id: number, Name: string, ClassId: number) {
    let record = {
        Id: Id,
        Name: Name,
        ClassId: ClassId
    };
    await postRequest('/manage/group', { record });
}

export async function updateGroup(Id: number, Name: string, ClassId: number) {
    let record = {
        Id: Id,
        Name: Name,
        ClassId: ClassId
    };
    await putRequest('/manage/group/' + Id, { record });
}

export async function deleteGroup(Id: number) {
    await deleteRequest('/manage/group/' + Id);
}

