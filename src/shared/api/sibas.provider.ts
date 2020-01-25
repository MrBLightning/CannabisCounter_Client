import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { Siba, SibaRes } from "shared/interfaces/models/SystemModels";

export async function getSibaRes(): Promise<SibaRes[]> {
    return await getRequest<SibaRes[]>('/data/sibares');
}

export async function getSibas(): Promise<Siba[]> {
    return await getRequest<Siba[]>('/manage/siba');
}

export async function addSiba(Siba: number, Description: string) {
    let record = {
        Siba: Siba,
        Description: Description
    };
    await postRequest('/manage/siba', { record });
}

export async function updateSiba(Id: number, Siba: number, Description: string) {
    let record = {
        Id: Id,
        Siba: Siba,
        Description: Description
    };
    await putRequest('/manage/siba/' + Id, { record });
}

export async function deleteSiba(Id: number) {
    await deleteRequest('/manage/siba/' + Id);
}

