import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { CatalogItem, Group, Subgroup, Sapak, Branch, BranchNetwork, ReservedOrder, SingleSupplierItem } from "shared/interfaces/models/SystemModels";

export async function getItems(): Promise<CatalogItem[]> {
    return await getRequest<CatalogItem[]>('/data/catalogItem');
}

export async function getSingleSupplierItems(): Promise<SingleSupplierItem[]> {
    return await getRequest<SingleSupplierItem[]>('/data/singleSupplierItem');
}

export async function getBranches(): Promise<Branch[]> {
    return await getRequest<Branch[]>('/data/branch');
}

export async function getBranchNetworks(): Promise<BranchNetwork[]> {
    return await getRequest<BranchNetwork[]>('/data/branchNetwork');
}

export async function getSapakim(): Promise<Sapak[]> {
    return await getRequest<Sapak[]>('/data/sapak');
}

export async function getGroups(): Promise<Group[]> {
    return await getRequest<Group[]>('/data/group');
}

export async function getSubgroups(): Promise<Subgroup[]> {
    return await getRequest<Subgroup[]>('/data/subgroup');
}

export async function addLatestReservedOrders() {
    let record = {};
    return await postRequest('/order/distSingleItem/latest', { record });
}

export async function getReservedOrdersByDate(OrderDate: string): Promise<ReservedOrder[]> {
    return await getRequest<ReservedOrder[]>('/order/distSingleItem/' + OrderDate);
}

export async function getNextInternalOrderNumber(): Promise<number> {
    return await getRequest<number>('/data/counters/nextInternalOrderNumber');
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

export async function addReservedOrder(
    DeliveryDate: Date,
    OrderDate: Date,
    BarCode: number,
    NetworkId:number,
    BranchId: number,
    ClassId: number,
    GroupId: number,
    SupplierId: number,
    OrderNum:number,
    AmountOrdered:number,
    AmountApproved: number,
    CreatedBy: number,
    IsOrderSent:number,
    RecordType:string
) {
    let record = {
        DeliveryDate: DeliveryDate,
        OrderDate: OrderDate,
        BarCode: BarCode,
        NetworkId: NetworkId,
        BranchId: BranchId,
        ClassId: ClassId,
        GroupId: GroupId,
        SupplierId: SupplierId,
        OrderNum: OrderNum,
        AmountOrdered: AmountOrdered,
        AmountApproved: AmountApproved,
        CreatedBy: CreatedBy,
        IsOrderSent:IsOrderSent,
        RecordType: RecordType
    };
    await postRequest('/order/distSingleItem', { record });
}

export async function updateReservedOrder(
    Id: number,
    DeliveryDate: Date,
    OrderDate: Date,
    BarCode: number,
    NetworkId:number,
    BranchId: number,
    ClassId: number,
    GroupId: number,
    SupplierId: number,
    OrderNum:number,
    AmountOrdered:number,
    AmountApproved: number,
    CreatedBy: number,
    IsOrderSent:number,
    RecordType:string
) {
    let record = {
        Id: Id,
        DeliveryDate: DeliveryDate,
        OrderDate: OrderDate,
        BarCode: BarCode,
        NetworkId: NetworkId,
        BranchId: BranchId,
        ClassId: ClassId,
        GroupId: GroupId,
        SupplierId: SupplierId,
        OrderNum: OrderNum,
        AmountOrdered: AmountOrdered,
        AmountApproved: AmountApproved,
        CreatedBy: CreatedBy,
        IsOrderSent:IsOrderSent,
        RecordType: RecordType
    };
    await putRequest('/order/distSingleItem/' + Id, { record });
}

// export async function deleteSiryun(Id: number) {
//     await deleteRequest('/order/reserveChicken/' + Id);
// }

