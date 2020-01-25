import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { Sapak } from "shared/interfaces/models/SystemModels";

export async function getSapakim(): Promise<Sapak[]> {
    return await getRequest<Sapak[]>('/manage/sapak');
}

export async function addSapak(Id: number, Name: string) {
    let record = {
        Id: Id, 
        Name: Name
    };
    await postRequest('/manage/sapak', { record });
}

export async function updateSapak(Id: number, Name: string) {
    let record = {
        Id: Id, 
        Name: Name
    };    
    await putRequest('/manage/sapak/' + Id, { record });
}

export async function deleteSapak(Id:number) {
    await deleteRequest('/manage/sapak/' + Id);
}
