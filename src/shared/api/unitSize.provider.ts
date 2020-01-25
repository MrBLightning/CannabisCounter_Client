import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { UnitSize } from "shared/interfaces/models/SystemModels";


export async function getUnitSizes(): Promise<UnitSize[]> {
    return await getRequest<UnitSize[]>('/manage/unitSize');
}

export async function addUnitSize(Id: number, Name: string) {
    let record = {
        Id: Id,
        Name: Name
    };
    await postRequest('/manage/unitSize', { record });
}

export async function updateUnitSize(Id: number, Name: string) {
    let record = {
        Id: Id,
        Name: Name
    };    
    await putRequest('/manage/unitSize/' + Id, { record });
}

export async function deleteUnitSize(Id:number) {
    await deleteRequest('/manage/unitSize/' + Id);
}

