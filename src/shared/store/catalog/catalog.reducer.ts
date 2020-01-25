import { CatalogState, CATALOG_ACTION, CatalogActions } from "./catalog.types";

export const initialCatalogState: CatalogState = {
    products: [],
    productsMap: {},
    productSales: {},
    barcodeStatusMap: {}
}


export function catalogReducer(state: CatalogState = initialCatalogState, action: CatalogActions): CatalogState {
    switch (action.type) {
        case CATALOG_ACTION.SET_CATALOG:
            return {
                ...state,
                products: action.products,
                productsMap: toMap(action.products, "BarCode")
            };
        case CATALOG_ACTION.SET_BARCODE_STATUSES:
            return {
                ...state,
                barcodeStatusMap: toMap(action.statuses, "BarCode")
            };
        case CATALOG_ACTION.EDIT_BARCODE_STATUS:
            return {
                ...state,
                barcodeStatusMap: {
                    ...state.barcodeStatusMap,
                    [action.barcode]: {
                        ...state.barcodeStatusMap[action.barcode],
                        Message: action.message
                    }
                }
            };
        case CATALOG_ACTION.UPDATE_CATALOG_PRODUCTS:
            const editProductMap: { [key: number]: number } = {};
            for (let i = 0; i < action.products.length; i++) {
                const product = action.products[i];
                editProductMap[product.BarCode] = i;
            }
            const newProducts = state.products.map(v => {
                if (editProductMap[v.BarCode] == null)
                    return v;
                const foundProduct = action.products[editProductMap[v.BarCode]];
                if (!foundProduct) return v;
                return {
                    ...v,
                    ...foundProduct
                }
            });
            return {
                ...state,
                products: newProducts,
                productsMap: toMap(newProducts, "BarCode")
            };
        case CATALOG_ACTION.EDIT_PRODUCT_DIMENSIONS:
            const dimensions = action.dimensions;
            const products = state.products.map(p => {
                if (p.BarCode === action.barcode)
                    return {
                        ...p,
                        height: dimensions.height,
                        width: dimensions.width,
                        length: dimensions.depth,
                    }
                return p;
            })
            return {
                ...state,
                products,
                productsMap: toMap(products, "BarCode")
            };
        case CATALOG_ACTION.SET_SALE_WEEKLY:
            return {
                ...state,
                productSales: {
                    ...state.productSales,
                    [action.barcode]: {
                        weekly: action.weekly,
                        monthly: null // action.monthly
                    }
                }
            }
        case CATALOG_ACTION.SET_SALE_WEEKLY_BUTCH:
            return {
                ...state,
                productSales: {
                    ...state.productSales,
                    ...action.salesMap
                }
            }
        default:
            return state;
    }
}

export function toMap(list: any[], property = "BarCode") {
    const map: any = {};
    for (let i = 0; i < list.length; i++)
        map[list[i][property]] = list[i];
    return map;
}