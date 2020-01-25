import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { CatalogItem, Department, Group, UnitSize, Branch, SibaRes, Siba, InitialItemsToTransfer, InitialItemInventory, InitialItemsToDestroy } from "shared/interfaces/models/SystemModels";

export async function getSibaRes(): Promise<SibaRes[]> {
    return await getRequest<SibaRes[]>('/data/sibares');
}

export async function getSibas(): Promise<Siba[]> {
    return await getRequest<Siba[]>('/data/siba');
}

export async function getInitialItemsToDestroy(BranchId: number): Promise<InitialItemsToDestroy[]> {
    return await getRequest<InitialItemsToDestroy[]>('/data/initialItemsToDestroy/' + BranchId);
}

export async function getNextDestructionNumber(): Promise<number> {
    return await getRequest<number>('/data/counters/nextDestructionNumber');
}

export async function addDestruction(DestructionNumber: number, DestructionReason: number,
    DestructionAuth: number, BarCode: number, Amount: number, BranchId: number,
    NetworkId: number, CreatedDate: Date, CreatedBy: number): Promise<number> {
    let record = {
        DestructionNumber: DestructionNumber,
        DestructionReason: DestructionReason,
        DestructionAuth: DestructionAuth,
        BarCode: BarCode,
        Amount: Amount,
        BranchId: BranchId,
        NetworkId: NetworkId,
        CreatedDate: CreatedDate,
        CreatedBy: CreatedBy
    };
    return await postRequest<number>('/manage/destruction', { record });
}

// export async function deleteOrder(OrderNum: number) {
//     await deleteRequest('/order/orderItem/' + OrderNum);
// }

