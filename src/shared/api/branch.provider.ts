import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { Branch, BranchType, BranchNetwork } from "shared/interfaces/models/SystemModels";

export async function getBranchNetworks(): Promise<BranchNetwork[]> {
    return await getRequest<BranchNetwork[]>('/data/branchNetwork');
}

export async function getBranchTypes(): Promise<BranchType[]> {
    return await getRequest<BranchType[]>('/data/branchType');
}

export async function getBranches(): Promise<Branch[]> {
    return await getRequest<Branch[]>('/manage/branch');
}

export async function getBranchById(BranchId:number): Promise<Branch[]> {
    return await getRequest<Branch[]>('/data/branch/' + BranchId);
}

export async function addBranch(BranchId: number, Name: string, BranchType: number, Percent: number,  
                                Weeks:number | null, TotMax:number | null, TotWeight:number | null) {
    let record = {
        BranchId: BranchId,
        Name: Name,
        BranchType: BranchType,
        Percent: Percent,
        Weeks: Weeks,
        TotMax: TotMax,
        TotWeight: TotWeight
    };
    await postRequest('/manage/branch', { record });
}

export async function updateBranch(BranchId: number, Name: string, BranchType: number, Percent: number,  
                                   Weeks:number | null, TotMax:number | null, TotWeight:number | null) {
    let record = {
        BranchId: BranchId,
        Name: Name,
        BranchType: BranchType,
        Percent: Percent,
        Weeks: Weeks,
        TotMax: TotMax,
        TotWeight: TotWeight
    };    
    await putRequest('/manage/branch/' + BranchId, { record });
}

export async function deleteBranch(BranchId:number) {
    await deleteRequest('/manage/branch/' + BranchId);
}

