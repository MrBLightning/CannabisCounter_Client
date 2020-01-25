import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { Category } from "shared/interfaces/models/SystemModels";

export async function getCategorys(): Promise<Category[]> {
    return await getRequest<Category[]>('/manage/category');
}

export async function addCategory(Id: number, Name: string) {
    let record = {
        Id: Id, 
        Name: Name,
    };
    await postRequest('/manage/category', { record });
}

export async function updateCategory(Id: number, Name: string) {
    let record = {
        Id: Id, 
        Name: Name,
    };
    await putRequest('/manage/category/' + Id, { record });
}

export async function deleteCategory(Id:number) {
    await deleteRequest('/manage/category/' + Id);
}

