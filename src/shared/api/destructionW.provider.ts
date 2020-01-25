import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { Destructions } from "shared/interfaces/models/SystemModels";
import { Siba, SibaRes, User, CatalogItem, Branch } from "shared/interfaces/models/SystemModels";


export async function getDestructions(): Promise<Destructions[]> {
    return await getRequest<Destructions[]>('/data/destructionW');
}

export async function getBranches(): Promise<Branch[]> {
    return await getRequest<Branch[]>('/data/branch');
}


export async function getSibaRes(): Promise<SibaRes[]> {
    return await getRequest<SibaRes[]>('/data/sibares');
}


export async function getSibas(): Promise<Siba[]> {
    return await getRequest<Siba[]>('/data/siba');
}

export async function getUsers(): Promise<User[]> {
    return await getRequest<User[]>('data/user');
}

export async function getCatalogItems(): Promise<CatalogItem[]> {
    return await getRequest<CatalogItem[]>('/data/catalogItem');
}

export async function updateDestruction(dstrId: number, status: string, notes: string) {
    let record = {
        DestructionNumber: dstrId,
        Status: status,
        Notes: notes
    };
    await putRequest('/manage/destructionW/' + dstrId, { record });
}




// export async function updateDestruction(dstrId: number, status: string, notes: string){
//     let record = {
//         dstrId: dstrId,
//         status: status,
//         notes: notes
//     }
//     await putRequest('/data/destructionW/' + dstrId, { record });
// } 