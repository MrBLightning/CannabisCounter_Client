import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { CampaignType } from "shared/interfaces/models/SystemModels";
import { Siba, SibaRes, User, CatalogItem, Branch } from "shared/interfaces/models/SystemModels";


export async function getCampaignItems(): Promise<CampaignType[]> {
    return await getRequest<CampaignType[]>('/data/product-campaign');
}


export async function getCatalogItems(): Promise<CatalogItem[]> {
    return await getRequest<CatalogItem[]>('/data/catalogItem');
}

export async function updateProductCampaignItem(id: number, record: any) {

    await putRequest('/manage/product-campaign/' + id, { record });
}

export async function addProductCampaignItem(record: any) {

    await postRequest('/manage/product-campaign', { record });
}

export async function deleteProductCampaignItem(id: number) {

    await deleteRequest('/manage/product-campaign/' + id);
}

export async function updateProductCampaignParent(record: any) {

    await putRequest('/manage/product-campaign/', { record });
}

