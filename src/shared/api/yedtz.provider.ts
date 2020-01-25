import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { Yedtzs} from "shared/interfaces/models/SystemModels";


export async function getYedtzItems(): Promise<Yedtzs[]> {
    return await getRequest<Yedtzs[]>('/data/yedtz');
}


export async function updateYedtzItem(id:number,name: string) {
    let record = {
        Name: name
    };
    await putRequest('/manage/yedtz/' + id, { record });
}


export async function deleteYedtzItem(id:number) {
  
    await deleteRequest('/manage/yedtz/' + id);
}


export async function addYedtzItem(Name:string) {
    let record = {
        Name:Name
    };
    await postRequest('/manage/yedtz', { record });
}