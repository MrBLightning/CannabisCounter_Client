import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { CatalogItem, Department, Group, Subgroup, Degem, Sapak, UnitSize } from "shared/interfaces/models/SystemModels";

export async function getItems(): Promise<CatalogItem[]> {
    return await getRequest<CatalogItem[]>('/manage/item');
}

export async function getCatalogItemById(BarCode: number): Promise<CatalogItem[]> {
    return await getRequest<CatalogItem[]>('/data/catalogItem/' + BarCode);
}

export async function getItemById(BarCode:number): Promise<CatalogItem[]> {
    return await getRequest<CatalogItem[]>('/manage/item/' + BarCode);
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
    return await getRequest<Degem[]>('/data/degem');
}

export async function getSapaks(): Promise<Sapak[]> {
    return await getRequest<Sapak[]>('/data/sapak');
}

export async function getUnitSizes(): Promise<UnitSize[]> {
    return await getRequest<UnitSize[]>('/data/unitsize');
}

export async function addItem(
    BarCode: number,
    Name: string,
    ClassesId: number,
    GroupId: number,
    SubGroupId: number,
    SapakId: number,
    DegemId: number,
    Adegem: number,
    p_loss: boolean,
    Shakele: boolean,
    Ariza: number,
    UnitAriza:number,
    statusCalMlay: boolean,
    Archives: number,
    Create_Date: Date | null,
    BL_datebuy: Date | null,
    Pesach: boolean | null,
    length: number | null,
    lengthSize: number | null,
    width: number | null,
    widthSize: number | null,
    height: number | null,
    heightSize: number | null,
    scope: number | null,
    scopeSize: number | null,
    weightGross: number | null,
    weightGrossSize: number | null,
    weightNeto: number | null,
    weightNetoSize: number | null,
    techula: number | null,
    techulaSize: number | null
) {
    let record = {
        BarCode: BarCode,
        CatalogId:BarCode,
        Name: Name,
        ClassesId: ClassesId,
        GroupId: GroupId,
        SubGroupId: SubGroupId,
        SapakId: SapakId,
        DegemId: DegemId,
        Adegem: Adegem,
        p_loss: p_loss,
        Shakele: Shakele,
        Ariza: Ariza,
        UnitAriza: UnitAriza,
        statusCalMlay: statusCalMlay,
        Archives: Archives,
        Create_Date: Create_Date,
        BL_datebuy: BL_datebuy,
        Pesach: Pesach,
        length: length,
        lengthSize: lengthSize,
        width: width,
        widthSize: widthSize,
        height: height,
        heightSize: heightSize,
        scope: scope,
        scopeSize: scopeSize,
        weightGross: weightGross,
        weightGrossSize: weightGrossSize,
        weightNeto: weightNeto,
        weightNetoSize: weightNetoSize,
        techula: techula,
        techulaSize: techulaSize
    };
    await postRequest('/manage/item', { record });
}

export async function updateItem(
    BarCode: number,
    Name: string,
    ClassesId: number,
    GroupId: number,
    SubGroupId: number,
    SapakId: number,
    DegemId: number,
    Adegem: number,
    p_loss: boolean,
    Shakele: boolean,
    Ariza: number,
    UnitAriza:number,
    statusCalMlay: boolean,
    Archives: number,
    Create_Date: Date | null,
    BL_datebuy: Date | null,
    Pesach: boolean | null,
    length: number | null,
    lengthSize: number | null,
    width: number | null,
    widthSize: number | null,
    height: number | null,
    heightSize: number | null,
    scope: number | null,
    scopeSize: number | null,
    weightGross: number | null,
    weightGrossSize: number | null,
    weightNeto: number | null,
    weightNetoSize: number | null,
    techula: number | null,
    techulaSize: number | null
) {
    let record = {
        BarCode: BarCode,
        CatalogId:BarCode,
        Name: Name,
        ClassesId: ClassesId,
        GroupId: GroupId,
        SubGroupId: SubGroupId,
        SapakId: SapakId,
        DegemId: DegemId,
        Adegem: Adegem,
        p_loss: p_loss,
        Shakele: Shakele,
        Ariza: Ariza,
        UnitAriza: UnitAriza,
        statusCalMlay: statusCalMlay,
        Archives: Archives,
        Create_Date: Create_Date,
        BL_datebuy: BL_datebuy,
        Pesach: Pesach,
        length: length,
        lengthSize: lengthSize,
        width: width,
        widthSize: widthSize,
        height: height,
        heightSize: heightSize,
        scope: scope,
        scopeSize: scopeSize,
        weightGross: weightGross,
        weightGrossSize: weightGrossSize,
        weightNeto: weightNeto,
        weightNetoSize: weightNetoSize,
        techula: techula,
        techulaSize: techulaSize
    };
    await putRequest('/manage/item/' + BarCode, { record });
}

export async function deleteItem(BarCode: number) {
    await deleteRequest('/manage/item/' + BarCode);
}

