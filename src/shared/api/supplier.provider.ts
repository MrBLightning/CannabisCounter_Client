import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { Supplier } from "shared/interfaces/models/SystemModels";

export async function getSuppliers(): Promise<Supplier[]> {
    return await getRequest<Supplier[]>('/manage/suppliers');
}

export async function addSupplier(Id: number, Name: string) {
    let record = {
        Id: Id, 
        Name: Name
    };
    await postRequest('/manage/suppliers', { record });
}

export async function updateSupplier(Id: number, Name: string) {
    let record = {
        Id: Id, 
        Name: Name
    };
    await putRequest('/manage/suppliers/' + Id, { record });
}

export async function deleteSupplier(Id:number) {
    await deleteRequest('/manage/suppliers/' + Id);
}

