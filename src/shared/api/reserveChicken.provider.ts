import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { CatalogItem, Department, Group, Subgroup, Degem, Sapak, UnitSize, Supsiryun, Siryun } from "shared/interfaces/models/SystemModels";

export async function getItems(): Promise<CatalogItem[]> {
    return await getRequest<CatalogItem[]>('/data/catalogItem');
}

export async function getSupSiryuns(): Promise<Supsiryun[]> {
    return await getRequest<Supsiryun[]>('/data/supSiryun');
}

export async function getSapakim(): Promise<Sapak[]> {
    return await getRequest<Sapak[]>('/data/sapak');
}

export async function getDepartments(): Promise<Department[]> {
    return await getRequest<Department[]>('/data/department');
}

export async function getGroups(): Promise<Group[]> {
    return await getRequest<Group[]>('/data/group');
}

export async function getSubgroups(): Promise<Subgroup[]> {
    return await getRequest<Subgroup[]>('/data/subgroup');
}

export async function getDegems(): Promise<Degem[]> {
    return await getRequest<Degem[]>('/data/department');
}

export async function getSapaks(): Promise<Sapak[]> {
    return await getRequest<Sapak[]>('/data/sapak');
}

export async function getUnitSizes(): Promise<UnitSize[]> {
    return await getRequest<UnitSize[]>('/data/unitsize');
}

export async function getSiryunByDate(CreateDate: string): Promise<Siryun[]> {
    return await getRequest<Siryun[]>('/order/reserveChicken/' + CreateDate);
}

export async function getSiryunTable(CreateDate: number): Promise<any[]> {
    return await getRequest<any[]>('/order/reserveChicken/buildTable/' + CreateDate);
}

export async function addSiryun(
    CreateDate: Date,
    BarCode: number,
    ClassId: number,
    GroupId: number,
    SapakId: number,
    SapakSiryun: number | null,
    CreatedBy: number
) {
    let record = {
        CreateDate: CreateDate,
        BarCode: BarCode,
        ClassId: ClassId,
        GroupId: GroupId,
        SapakId: SapakId,
        SapakSiryun: SapakSiryun,
        CreatedBy: CreatedBy
    };
    await postRequest('/order/reserveChicken', { record });
}

export async function updateSiryun(
    CreateDate: string,
    BarCode: number,
    SapakId: number,
    SapakSiryun: number | null,
) {
    let recordWhere = {
        CreateDate: CreateDate,
        BarCode: BarCode,
        SapakId: SapakId,
    };
    let record = {
        SapakSiryun: SapakSiryun,
    };
    await putRequest('/order/reserveChicken', { recordWhere, record});
}

export async function deleteSiryun(Id: number) {
    await deleteRequest('/order/reserveChicken/' + Id);
}

