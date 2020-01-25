import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { AspakaRecord, Sapak, BranchType, Branch } from "shared/interfaces/models/SystemModels";


export async function getSapakim(): Promise<Sapak[]> {
    return await getRequest<Sapak[]>('/data/sapak');
}

export async function getBranchTypes(): Promise<BranchType[]> {
    return await getRequest<BranchType[]>('/data/branchType');
}

export async function getBranches(): Promise<Branch[]> {
    return await getRequest<Branch[]>('/data/branch');
}


export async function getAspakaRecords(): Promise<AspakaRecord[]> {
    return await getRequest<AspakaRecord[]>('/manage/aspaka');
}

export async function addAspakaRecord(SapakId: number, BranchId: string, AspakaDay: number, OrderDay: number,  
    Wensell:number, days_order:number) {
    let record = {
        SapakId: SapakId,
        BranchId: BranchId,
        AspakaDay:AspakaDay,
        OrderDay: OrderDay,
        Wensell: Wensell,
        days_order: days_order
    };
    await postRequest('/manage/aspaka', { record });
}

export async function updateAspakaRecord(Id:number, SapakId: number, BranchId: string, AspakaDay: number, OrderDay: number,  
    Wensell:number, days_order:number) {
    let record = {
        Id:Id,
        SapakId: SapakId,
        BranchId: BranchId,
        AspakaDay:AspakaDay,
        OrderDay: OrderDay,
        Wensell: Wensell,
        days_order: days_order
    };    
    await putRequest('/manage/aspaka/' + Id, { record });
}

export async function deleteAspakaRecord(Id:number) {
    await deleteRequest('/manage/aspaka/' + Id);
}


