import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { Yeds, Branch } from "shared/interfaces/models/SystemModels";


export async function getYedItems(): Promise<Yeds[]> {
    console.log("gettz")
    return await getRequest<Yeds[]>('/data/yed');
}


export async function updateYedItem(Name: string, Id: number, fdatec: Date, tdatec: Date, date_buy: Date, rem_lines: string, snif_katan: string) {
    let record = {
        Name: Name,
        fdatec: fdatec,
        tdatec: tdatec,
        date_buy: date_buy,
        rem_lines: rem_lines,
        snif_katan: snif_katan
    };
    await putRequest('/manage/yed/' + Id, { record });
}


export async function deleteYedItem(id: number) {

    await deleteRequest('/manage/yed/' + id);
}


export async function addYedItem(record: any) {
    // let record = {
    //     Name: Name
    // };
    await postRequest('/manage/yed', { record });
}

export async function getBranches(): Promise<Branch[]> {
    console.log("branch")
    return await getRequest<Branch[]>('/data/branch');
}
