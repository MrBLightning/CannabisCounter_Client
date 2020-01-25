export type CatalogBarcode = number;

export interface CatalogProduct {
    Id: number,
    BarCode: CatalogBarcode,
    Name: string,
    CatalogId?: number,
    ClassesId?: number,
    GroupId?: number,
    SubGroupId?: number,
    SapakId?: number,
    DegemId?: number,

    Ariza?: number,
    Archives?: number,
    length?: number,
    width?: number,
    height?: number,
    weightGross?: number,

    ts?: String | Date,
    DegemName?:string
}

export interface BarcodeStatus {
    Id: number,
    BarCode: CatalogBarcode,
    Message?: string,
    UserId?: number
    UpdatedAt: String | Date,
}