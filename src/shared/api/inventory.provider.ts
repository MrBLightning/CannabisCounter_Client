import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { CatalogItem, Department, Group, UnitSize, Branch, SibaRes, Siba, InitialItemsToTransfer, InitialItemInventory } from "shared/interfaces/models/SystemModels";

export async function getInitialItemsInventory(BranchId: number): Promise<InitialItemInventory[]> {
    return await getRequest<InitialItemInventory[]>('/data/initialItemInventory/' + BranchId);
}

export async function getNextInventoryNumber(): Promise<number> {
    return await getRequest<number>('/data/counters/nextInventoryNumber');
}

export async function addInventory(InventoryNumber: number, BarCode: number, Amount: number, BranchId: number,
    NetworkId: number, CreatedDate: Date, CreatedBy: number): Promise<number> {
    let record = {
        InventoryNumber: InventoryNumber,
        BarCode: BarCode,
        Amount: Amount,
        BranchId: BranchId,
        NetworkId: NetworkId,
        CreatedDate: CreatedDate,
        CreatedBy: CreatedBy
    };
    return await postRequest<number>('/manage/inventory', { record });
}

// export async function deleteOrder(OrderNum: number) {
//     await deleteRequest('/order/orderItem/' + OrderNum);
// }

