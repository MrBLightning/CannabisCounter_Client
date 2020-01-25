import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { CatalogItem, Department, Group, InitialOrderInventory, Sapak, UnitSize, Branch, InternalOrder } from "shared/interfaces/models/SystemModels";

export async function getCatalogItem(): Promise<CatalogItem[]> {
    return await getRequest<CatalogItem[]>('/data/catalogItem');
}

export async function getDepartments(): Promise<Department[]> {
    return await getRequest<Department[]>('/data/department');
}

export async function getUnitSizes(): Promise<UnitSize[]> {
    return await getRequest<UnitSize[]>('/data/unitsize');
}

export async function getGroups(): Promise<Group[]> {
    return await getRequest<Group[]>('/data/group');
}

export async function getBranchById(BranchId: number): Promise<Branch[]> {
    return await getRequest<Branch[]>('/data/branch/' + BranchId);
}

export async function getInitialOrderInventory(BranchId: number): Promise<InitialOrderInventory[]> {
    return await getRequest<InitialOrderInventory[]>('/data/initialOrderInventory/' + BranchId);
}

export async function getNextInternalOrderNumber(): Promise<number> {
    return await getRequest<number>('/data/counters/nextInternalOrderNumber');
}

export async function getInternalOrdersByUser(UserId: number): Promise<InternalOrder[]> {
    return await getRequest<InternalOrder[]>('/data/internalOrder/' + UserId);
}

export async function addInternalOrder(
    BranchId: number,
    OrderNum: number,
    OrderDate: Date,
    BarCode: number,
    GroupId: number,
    SupplierId: number,
    AmountOrdered: number,
    DeliveryDate: Date, 
    CreatedBy: number
  ) {
    let record = {
        BranchId: BranchId,
        OrderNum: OrderNum,
        OrderDate: OrderDate,
        BarCode: BarCode,
        GroupId: GroupId,
        SupplierId: SupplierId,
        AmountOrdered: AmountOrdered,
        DeliveryDate: DeliveryDate, 
        CreatedBy: CreatedBy
          };
    await postRequest('/order/internalOrder', { record });
}

export async function deleteInternalOrder(OrderNum: number) {
    await deleteRequest('/order/internalOrder/' + OrderNum);
}

