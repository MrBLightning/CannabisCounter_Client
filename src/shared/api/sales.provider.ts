import { getRequest } from "shared/http";

export type CatalogSaleRecord = {
    BarCode: number,
    BranchId?: number,
    // DateBuy: string,
    TotalAmount: number,
    TotalPrice: number,
    SupplierId?: number,
    GroupId?: number,
    SubGroupId?: number,
    ClassId?: number,
}

export const fetchCatalogSales = async (data: {
    beginDate: Date,
    endDate: Date,
    branch?: number[],
    supplier?: number[],
    group?: number[],
    class?: number[]
}): Promise<CatalogSaleRecord[]> => {
    const response = await getRequest<{
        status: string,
        sales: CatalogSaleRecord[]
    }>('planogram/sales', {
        params: data,
    });
    return response.sales;
}