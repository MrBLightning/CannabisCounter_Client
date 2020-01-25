import { PlacementObject, DimensionObject, PlanogramItem, PlanogramSection, PlanogramShelf } from "shared/store/planogram/planogram.types";
import { CatalogProduct } from "shared/interfaces/models/CatalogProduct";
import { catalogProductDimensionObject } from "./planogram.service";

const pixelDensity = 0.5; // 3mm to 1px

// mm to px
export function widthDensity(width: number): number {
    return width * pixelDensity;
}
export function heightDensity(height: number): number {
    return height * pixelDensity;
}

export function shelfItemDimensions(placement: PlacementObject, dimensions: DimensionObject): DimensionObject {
    const { faces, row, stack } = placement;
    const { height, width, depth } = dimensions;
    return {
        height: height * stack,
        width: width * faces,
        depth: depth * row
    }
}
export function shelfItemMaxAmount(placement: PlacementObject): number {
    return placement.faces * placement.row * placement.stack;
}
// export function calculateShelvesHeight(section: Section): number {
//     const maxWidth = section.dimensions.width;
//     let value = 0;
//     let accumulator = 0;
//     for (let i = 0; i < section.shelves.length; i++) {
//         const shelf = section.shelves[i];
//         accumulator += shelf.dimensions.width;
//         if (accumulator >= maxWidth) {
//             value += shelf.dimensions.height;
//             accumulator = 0;
//         }
//     }
//     return value;
// }
export function calculateShelvesHeight(section: PlanogramSection): number {
    return section.shelves.length > 0 ? section.shelves.map(sh => sh.dimensions.height).reduce((p, c) => p + c) : 0;
}

export function shelfAvailableSpace(shelf: PlanogramShelf | PlanogramShelf[], productMap: { [key: number]: CatalogProduct }): DimensionObject {
    let items: PlanogramItem[] = [];
    let dimensions: DimensionObject = {
        height: 0,
        width: 0,
        depth: 0,
    }
    if (shelf instanceof Array) {
        items = shelf.map(sh => sh.items).reduce((p, c) => p.concat(c));
        dimensions = {
            height: shelf.map(sh => sh.dimensions.height).reduce((p, c) => Math.min(p, c)),
            width: shelf.map(sh => sh.dimensions.width).reduce((p, c) => p + c),
            depth: shelf.map(sh => sh.dimensions.depth).reduce((p, c) => Math.min(p, c))
        }
    }
    else {
        items = shelf.items;
        dimensions = shelf.dimensions;
    }


    if (items.length === 0)
        return dimensions;
    const { height, width, depth } = dimensions;
    const shelfSpace = items.map((item) => {
        return shelfItemDimensions(item.placement, catalogProductDimensionObject(productMap[item.product]))
    }).reduce((p, c) => ({
        width: p.width + c.width,
        height: Math.max(p.height, c.height),
        depth: Math.max(p.depth, c.depth),
    }))
    return {
        width: width - shelfSpace.width,
        height: height - shelfSpace.height,
        depth: depth - shelfSpace.depth
    }
}

export function swapArray(list: any[]): any[] {
    const newList = [];
    for (let i = list.length - 1; i >= 0; i--)
        newList.push(list[i]);
    return newList;
}