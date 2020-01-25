import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { Sapak, Branch, CodeConversion } from "shared/interfaces/models/SystemModels";

export async function getSapakim(): Promise<Sapak[]> {
    return await getRequest<Sapak[]>('/data/sapak');
}

export async function getBranches(): Promise<Branch[]> {
    return await getRequest<Branch[]>('/data/branch');
}

export async function getCodeConversions(): Promise<CodeConversion[]> {
    return await getRequest<CodeConversion[]>('/manage/codeConversion');
}

export async function addCodeConversion(Code: number, Branch: number, Sapak: number) {
    let record = {
        Code: Code, 
        Branch: Branch,
        Sapak: Sapak
    };
    await postRequest('/manage/codeConversion', { record });
}

export async function updateCodeConversion(Code: number, Branch: number, Sapak: number) {
    let record = {
        Code: Code, 
        Branch: Branch,
        Sapak: Sapak
    };    
    await putRequest('/manage/codeConversion/' + Code, { record });
}

export async function deleteCodeConversion(Code:number) {
    await deleteRequest('/manage/codeConversion/' + Code);
}
