import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { CatalogItem, Department, Group, Sapak, UnitSize, Branch, Order, User, BranchNetwork } from "shared/interfaces/models/SystemModels";

export async function getCatalogItems(): Promise<CatalogItem[]> {
    return await getRequest<CatalogItem[]>('/data/catalogItem');
}

export async function getBranches(): Promise<Branch[]> {
    return await getRequest<Branch[]>('/data/branch');
}

export async function getBranchNetworks(): Promise<BranchNetwork[]> {
    return await getRequest<BranchNetwork[]>('/data/branchNetwork');
}

export async function getDepartments(): Promise<Department[]> {
    return await getRequest<Department[]>('/data/department');
}

export async function getUnitSizes(): Promise<UnitSize[]> {
    return await getRequest<UnitSize[]>('/data/unitsize');
}

export async function getUsers(): Promise<User[]> {
    return await getRequest<User[]>('/data/user');
}

export async function getOrders(): Promise<Order[]> {
    return await getRequest<Order[]>('/data/order');
}

export async function getOrdersByDate(searchDate: string): Promise<Order[]> {
    return await getRequest<Order[]>('/data/order/byDate/' + searchDate);
}

export async function getBranchById(BranchId: number): Promise<Branch> {
    return await getRequest<Branch>('/data/branch/' + BranchId);
}

// export async function getInitialOrderInventory(BranchId: number): Promise<InitialOrderInventory[]> {
//     return await getRequest<InitialOrderInventory[]>('/data/initialOrderInventory/' + BranchId);
// }

export async function getOrdersByUser(UserId: number): Promise<Order[]> {
    return await getRequest<Order[]>('/data/order/' + UserId);
}

export async function getNextOrderNumber(): Promise<number> {
    return await getRequest<number>('/data/counters/nextOrderNumber');
}

export async function updateOrderData(
    OrderNum: number,
    AspakaDate: Date
) {
    let record = {
        OrderNum: OrderNum,
        AspakaDate: AspakaDate
    };
    await putRequest('/order/orderItem', { record });
}

export async function addOrder(
    OrderNum: number,
    NetworkId: number,
    BarCode: number,
    GroupId: number,
    SapakId: number,
    AmountOrder: number,
    BranchId: number,
    CreatedBy: number,
    OrderDate: Date,
    AspakaDate: Date,
    //AmountReceive:number
) {
    let record = {
        OrderNum: OrderNum,
        NetworkId: NetworkId,
        BarCode: BarCode,
        GroupId: GroupId,
        SapakId: SapakId,
        AmountOrder: AmountOrder,
        BranchId: BranchId,
        CreatedBy: CreatedBy,
        OrderDate: OrderDate,
        AspakaDate: AspakaDate,
        //AmountReceive:AmountReceive
    };
    await postRequest('/order/orderItem', { record });
}

export async function updateOrder(
    Id: number,
    OrderNum: number,
    NetworkId: number,
    BarCode: number,
    GroupId: number,
    SapakId: number,
    AmountOrder: number,
    BranchId: number,
    CreatedBy: number,
    OrderDate: Date,
    AspakaDate: Date,
    //AmountReceive:number
) {
    let record = {
        Id: Id,
        OrderNum: OrderNum,
        NetworkId: NetworkId,
        BarCode: BarCode,
        GroupId: GroupId,
        SapakId: SapakId,
        AmountOrder: AmountOrder,
        BranchId: BranchId,
        CreatedBy: CreatedBy,
        OrderDate: OrderDate,
        AspakaDate: AspakaDate,
        //AmountReceive:AmountReceive
    };
    await putRequest('/order/orderItem/' + Id, { record });
}

export async function deleteOrder(OrderNum: number) {
    await deleteRequest('/order/orderItem/' + OrderNum);
}






