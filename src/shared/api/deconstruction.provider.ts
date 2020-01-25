import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { CatalogItem, Department, Group, UnitSize, Branch, SibaRes, Siba, InitialItemsToTransfer, InitialItemInventory, InitialItemsToDestroy } from "shared/interfaces/models/SystemModels";

export async function getNextDeconstructNumber(): Promise<number> {
    return await getRequest<number>('/data/counters/nextDeconstructNumber');
}

export async function addDeconstruction(DeconstructNumber: number, BarCodeParent: number, ParentAmount: number, BarCodeChild: number,
    ChildAmount: number, SapakId: number, Comment: string, PrepareDate: Date, CreatedDate: Date, CreatedBy: number): Promise<number> {
    let record = {
        DeconstructNumber: DeconstructNumber,
        BarCodeParent: BarCodeParent,
        ParentAmount: ParentAmount,
        BarCodeChild: BarCodeChild,
        ChildAmount: ChildAmount,
        SapakId: SapakId,
        Comment: Comment,
        PrepareDate: PrepareDate,
        CreatedDate: CreatedDate,
        CreatedBy: CreatedBy
    };
    return await postRequest<number>('/manage/deconstruction', { record });
}

// export async function deleteOrder(OrderNum: number) {
//     await deleteRequest('/order/orderItem/' + OrderNum);
// }

