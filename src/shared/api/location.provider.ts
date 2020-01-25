import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { Location } from "shared/interfaces/models/SystemModels";

export async function getLocations(): Promise<Location[]> {
    return await getRequest<Location[]>('/manage/locations');
}

export async function addLocation(Id: number, Name: string) {
    let record = {
        Id: Id, 
        Name: Name
    };
    await postRequest('/manage/locations', { record });
}

export async function updateLocation(Id: number, Name: string) {
    let record = {
        Id: Id, 
        Name: Name
    };
    await putRequest('/manage/locations/' + Id, { record });
}

export async function deleteLocation(Id:number) {
    await deleteRequest('/manage/locations/' + Id);
}

