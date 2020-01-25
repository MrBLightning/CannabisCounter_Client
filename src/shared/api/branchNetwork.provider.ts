import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { BranchNetwork } from "shared/interfaces/models/SystemModels";


export async function getBranchNetworks(): Promise<BranchNetwork[]> {
    return await getRequest<BranchNetwork[]>('/manage/branchNetwork');
}

export async function addBranchNetwork(Id: number, Name: string) {
    let record = {
        Id: Id,
        Name: Name
    };
    await postRequest('/manage/branchNetwork', { record });
}

export async function updateBranchNetwork(Id: number, Name: string) {
    let record = {
        Id: Id,
        Name: Name
    };    
    await putRequest('/manage/branchNetwork/' + Id, { record });
}

export async function deleteBranchNetwork(Id:number) {
    await deleteRequest('/manage/branchNetwork/' + Id);
}

