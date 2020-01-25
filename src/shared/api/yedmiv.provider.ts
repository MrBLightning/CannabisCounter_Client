import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { Yedmivs} from "shared/interfaces/models/SystemModels";


export async function getYedmivItems(): Promise<Yedmivs[]> {
    return await getRequest<Yedmivs[]>('/data/yedmiv');
}


export async function updateYedmivItem(id:number,name: string) {
    let record = {
        Name: name
    };
    await putRequest('/manage/yedmiv/' + id, { record });
}


export async function deleteYedmivItem(id:number) {
  
    await deleteRequest('/manage/yedmiv/' + id);
}


export async function addYedmivItem(Name:string) {
    let record = {
        Name:Name
    };
    await postRequest('/manage/yedmiv', { record });
}