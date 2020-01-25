
export type ProductPredictedSalesResponse = {
    barcode: number,
    amount: number
}

export type ProductWeekSales = {
    Id: number,
    BarCode: number,
    BranchId: number,
    WeeklyAverage: number | null,
}