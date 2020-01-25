import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { Pharmacy, Location, Stock, CannabisItem, Category, Supplier } from "shared/interfaces/models/SystemModels";

export async function getPharmacys(): Promise<Pharmacy[]> {
    return await getRequest<Pharmacy[]>('/manage/pharmacy');
}

export async function getLocations(): Promise<Location[]> {
    return await getRequest<Location[]>('/manage/locations');
}

export async function getStocks(): Promise<Stock[]> {
    return await getRequest<Stock[]>('/manage/stock');
}

export async function getCannabisItems(): Promise<CannabisItem[]> {
    return await getRequest<CannabisItem[]>('/manage/item');
}

export async function getCategorys(): Promise<Category[]> {
    return await getRequest<Category[]>('/manage/category');
}

export async function getSuppliers(): Promise<Supplier[]> {
    return await getRequest<Supplier[]>('/manage/suppliers');
}

export async function addStock(  PharmacyId: number, LocationId: number, CategoryId: number, SupplierId: number, InStock: number, ByUser: number ) {
    let record = {
        PharmacyId: PharmacyId,
        LocationId: LocationId, 
        CategoryId: CategoryId,
        SupplierId: SupplierId,
        InStock: InStock,
        ByUser: ByUser
    };
    await postRequest('/manage/stock', { record });
}

export async function updateStock(Id: number, PharmacyId: number, LocationId: number, CategoryId: number, SupplierId: number, InStock: number, ByUser: number ) {
    let record = {
        Id: Id, 
        PharmacyId: PharmacyId,
        LocationId: LocationId, 
        CategoryId: CategoryId,
        SupplierId: SupplierId,
        InStock: InStock,
        ByUser: ByUser
    };
    await putRequest('/manage/stock/' + Id, { record });
}

export async function deleteStock(Id:number) {
    await deleteRequest('/manage/stock/' + Id);
}

