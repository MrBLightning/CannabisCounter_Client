import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { SibaRes, Siba, InitialItemsToConvert } from "shared/interfaces/models/SystemModels";

export async function getSibaRes(): Promise<SibaRes[]> {
    return await getRequest<SibaRes[]>('/data/sibares');
}

export async function getSibas(): Promise<Siba[]> {
    return await getRequest<Siba[]>('/data/siba');
}

export async function getInitialItemsToConvert(BranchId: number): Promise<InitialItemsToConvert[]> {
    return await getRequest<InitialItemsToConvert[]>('/data/initialItemsToConvert/' + BranchId);
}

export async function getNextConversionNumber(): Promise<number> {
    return await getRequest<number>('/data/counters/nextConversionNumber');
}

export async function addConversion(ConversionNumber: number, ConversionReason: number, ConversionAuth: number,
    BarCodeFrom: number, BarCodeTo: number, Amount: number, BranchId: number,
    NetworkId: number, CreatedDate: Date, CreatedBy: number): Promise<number> {
    let record = {
        ConversionNumber: ConversionNumber,
        ConversionReason: ConversionReason,
        ConversionAuth: ConversionAuth,
        BarCodeFrom: BarCodeFrom,
        BarCodeTo: BarCodeTo,
        Amount: Amount,
        BranchId: BranchId,
        NetworkId: NetworkId,
        CreatedDate: CreatedDate,
        CreatedBy: CreatedBy
    };
    return await postRequest<number>('/manage/conversion', { record });
}

// export async function deleteOrder(OrderNum: number) {
//     await deleteRequest('/order/orderItem/' + OrderNum);
// }

