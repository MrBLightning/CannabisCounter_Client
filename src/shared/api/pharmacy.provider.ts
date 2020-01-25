import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { Pharmacy, Location } from "shared/interfaces/models/SystemModels";

export async function getPharmacys(): Promise<Pharmacy[]> {
    return await getRequest<Pharmacy[]>('/manage/pharmacy');
}

export async function getLocations(): Promise<Location[]> {
    return await getRequest<Location[]>('/manage/locations');
}

export async function addPharmacy(  LocationId: number, Name: string, Address: string, Phone: string ) {
    let record = {
        LocationId: LocationId, 
        Name: Name,
        Address: Address,
        Phone: Phone
    };
    await postRequest('/manage/pharmacy', { record });
}

export async function updatePharmacy(Id: number, LocationId: number, Name: string, Address: string, Phone: string ) {
    let record = {
        Id: Id, 
        LocationId: LocationId, 
        Name: Name,
        Address: Address,
        Phone: Phone
    };
    await putRequest('/manage/pharmacy/' + Id, { record });
}

export async function deletePharmacy(Id:number) {
    await deleteRequest('/manage/pharmacy/' + Id);
}

