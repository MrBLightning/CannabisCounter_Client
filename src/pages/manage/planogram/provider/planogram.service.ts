import { DimensionObject, ScateredDimensionObject } from "shared/store/planogram/planogram.types";
import { CatalogProduct } from "shared/interfaces/models/CatalogProduct";
import { ProductDefaultDimensions } from "shared/store/planogram/planogram.defaults";

export function dimensionText(dimensions: DimensionObject): string {
    return `${dimensions.height || 0}mm*${dimensions.width || 0}mm*${dimensions.depth || 0}mm`;
}

export function validateDimensions(data: ScateredDimensionObject): boolean {
    return data.height != null && data.width != null && data.depth != null &&
            data.height > 0 && data.width > 0 && data.depth > 0;
}

export function catalogProductDimensionObject(product:CatalogProduct|null):DimensionObject{
    if(product == null)
        return {
            ...ProductDefaultDimensions
        }
    return {
        height: product.height || 150,
        width: product.width || 150,
        depth: product.length || 150,
    }
}