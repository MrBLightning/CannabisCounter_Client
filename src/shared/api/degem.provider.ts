import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { Degem } from "shared/interfaces/models/SystemModels";

export async function getDegems(): Promise<Degem[]> {
    return await getRequest<Degem[]>('/manage/degem');
}

export async function addDegem(Id: number, Name: string) {
    let record = {
        Id: Id, 
        Name: Name
    };
    await postRequest('/manage/degem', { record });
}

export async function updateDegem(Id: number, Name: string) {
    let record = {
        Id: Id, 
        Name: Name
    };    
    await putRequest('/manage/degem/' + Id, { record });
}

export async function deleteDegem(Id:number) {
    await deleteRequest('/manage/degem/' + Id);
}

