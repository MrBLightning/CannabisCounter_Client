import { PlanogramActions, PlanogramAisle, PlanogramShelf, PlanogramState, PLANOGRAM_ACTIONS, PlanogramElementId, PlanogramStore } from "../planogram.types";
import { AISLE_ACTIONS } from "../store/aisle/aisle.types";
import { SECTION_ACTIONS } from "../store/section/section.types";
import { SHELF_ACTIONS } from "../store/shelf/shelf.types";
import { ITEM_ACTIONS } from "../store/item/item.types";
import { STORE_ACTIONS } from "../store/store.types";
import { padNumber, deepExtractKey } from "./deep-extract";
import { CatalogBarcode } from "shared/interfaces/models/CatalogProduct";
import { AppState } from "shared/store/app.reducer";
import { getRandomUniqueColor } from "./colors.provider";

export type ShelfDetail = {
    display: boolean,
    main_shelf: string | null,
    height_position: number,
    margin_bottom: number,
    height: number,
    combined: string[]
}


export type ShelfDetailsState = {
    [key: string]: ShelfDetail
}
export type ShelvesMapState = {
    [id: string]: PlanogramShelf
}
export type AislesMapState = {
    [id: string]: PlanogramAisle
}
export type GroupSection = {
    group_id: string,
    aisle: PlanogramElementId,
    aisle_name?: string,
    sections: PlanogramElementId[],
    shelves: PlanogramElementId[]
}
// SECTION PID: nubmer index position
export type GroupSectionsState = {
    groupMap: {
        [index: string]: GroupSection
    },
    groupList: string[],
    sectionToGroup: { [key: string]: string }
}

export type ColorMap = { [color_by: string]: string };

// shelfid: {}
export type VirtualStoreState = {
    shelfDetails: ShelfDetailsState,
    shelfMap: ShelvesMapState,
    aisleMap: AislesMapState,
    sectionGroups: GroupSectionsState,
    colorMap: ColorMap,
}

// const shelfRoundFactor = 5; // 5mm

type ShelfPosition = {
    x: number,
    y: number,
    w: number,
    id: string,
};
export const initialVirtualStoreState: VirtualStoreState = {
    shelfDetails: {},
    shelfMap: {},
    aisleMap: {},
    sectionGroups: {
        groupMap: {},
        groupList: [],
        sectionToGroup: {}
    },
    colorMap: {}
}

export function virtualizeReducer(state: AppState, action: PlanogramActions): VirtualStoreState {
    switch (action.type) {
        case PLANOGRAM_ACTIONS.SET_DISPLAY_AISLE:
        case STORE_ACTIONS.SET_VIEW:
        case AISLE_ACTIONS.ADD_AISLE:
        case AISLE_ACTIONS.SET_AISLE:
        case AISLE_ACTIONS.ADD_SECTION:
        case AISLE_ACTIONS.EDIT_AISLE_NAME:
        case AISLE_ACTIONS.REMOVE_AISLE:
        case SECTION_ACTIONS.ADD_SECTION:
        case SECTION_ACTIONS.DELETE_SECTION:
        case SECTION_ACTIONS.DUPLICATE_SECTION:
        case SECTION_ACTIONS.EDIT_SECTION_DIMENSION:
        case SECTION_ACTIONS.REMOVE_ITEMS:
        case SECTION_ACTIONS.SWITCH_SECTIONS:
        case SHELF_ACTIONS.ADD_SHELF:
        case SHELF_ACTIONS.DELETE_SHELF:
        case SHELF_ACTIONS.DUPLICATE_SHELF:
        case SHELF_ACTIONS.EDIT_SHELF_DIMENSIONS:
        case SHELF_ACTIONS.SWITCH_SHELVES:
        case ITEM_ACTIONS.ADD_PRODUCT:
        case ITEM_ACTIONS.DELETE_ITEM:
        case ITEM_ACTIONS.DUPLICATE_ITEM:
        case ITEM_ACTIONS.EDIT_ITEM_PLACEMENT:
        case ITEM_ACTIONS.SWITCH_ITEMS:
            if (!state.planogram.store)
                return initialVirtualStoreState;
            return {
                shelfDetails: shelfDetailsReducer(state.planogram.store),
                shelfMap: shelfMapReducer(state.planogram.store),
                aisleMap: aisleMapReducer(state.planogram.store),
                sectionGroups: combinedSectionsReducer(state.planogram.store),
                colorMap: aisleColorMapReducer(state)
            };
        default:
            return state.planogram.virtualStore;
    }
}

export function shelfMapReducer(store: PlanogramStore): ShelvesMapState {
    const shelvesMap: ShelvesMapState = {};
    for (const aisle of store.aisles) {
        for (let i = 0; i < aisle.sections.length; i++)
            for (let j = 0; j < aisle.sections[i].shelves.length; j++)
                shelvesMap[aisle.sections[i].shelves[j].id] = aisle.sections[i].shelves[j];
    }
    return shelvesMap;
}
function aisleMapReducer(store: PlanogramStore): AislesMapState {
    const aisleMap: AislesMapState = {};
    for (const aisle of store.aisles)
        aisleMap[aisle.aisle_id] = aisle;
    return aisleMap;
}

const COLOR_IGNORE_PERCENTAGE = 5;

function aisleColorMapReducer(state: AppState) {
    // const colorMap: { [key: string]: { [key: string]: string } } = {};
    const colorMap: ColorMap = {};
    const store = state.planogram.store;
    // const colorBy = state.planogram.display.colorBy;
    const catalogMap = state.catalog.productsMap;
    if (!store) return colorMap;
    const products: CatalogBarcode[] = deepExtractKey(store, "product");
    // for (const aisle of store.aisles) {
        // const aisleColorMap: { [key: string]: string } = {};
        // const products: CatalogBarcode[] = deepExtractKey(aisle, "product");
        const accuranceMap: { [key: string]: number } = {}
        for (const barcode of products) {
            const catalogProduct = catalogMap[barcode];
            if (!catalogProduct || !catalogProduct.SapakId) continue;
            const accuranceKey = catalogProduct.SapakId;
            if (!accuranceMap[accuranceKey])
                accuranceMap[accuranceKey] = 0;
            accuranceMap[accuranceKey] += 1;
        }

        const sumAccurances = Object.values(accuranceMap).reduce((p, c) => p + c, 0);
        const previousColors: Set<string> = new Set();
        for (const supplierId in accuranceMap) {
            const accuranceAmount = accuranceMap[supplierId];
            const percentage = Math.round((accuranceAmount / sumAccurances) * 100);
            const colorMapKey = percentage > COLOR_IGNORE_PERCENTAGE ? supplierId : "none";
            colorMap[colorMapKey] = getRandomUniqueColor(previousColors);
            previousColors.add(colorMap[colorMapKey]);
        }
        // colorMap[aisle.id] = aisleColorMap;
    // }
    return colorMap;
}

// function shelfDetailsReducer(aisle: PlanogramAisle): ShelfDetailsState {
export function shelfDetailsReducer(store: PlanogramStore): ShelfDetailsState {
    const shelfDetails: ShelfDetailsState = {};
    for (const aisle of store.aisles) {
        let x_section = 0;
        let pre_ids: string[] | null = null;
        // x,y,xbr
        const sh_positions: ShelfPosition[] = []
        for (let sectionIndex = 0; sectionIndex < aisle.sections.length; sectionIndex++) {
            const section = aisle.sections[sectionIndex];

            let sh_pos = 0;
            const collect_s_ids: string[] = [];
            for (let shelfIndex = 0; shelfIndex < section.shelves.length; shelfIndex++) {
                const shelf = section.shelves[shelfIndex];
                const ps = section.shelves[shelfIndex - 1];
                const shelf_dimensions = shelf.dimensions;
                collect_s_ids.push(shelf.id);

                let mb = 0;
                if (ps != null) {
                    const previousVirtualShelf = shelfDetails[ps.id];
                    if (previousVirtualShelf != null && previousVirtualShelf.display === false)
                        mb = previousVirtualShelf.height;
                }
                sh_positions.push({
                    id: shelf.id,
                    x: x_section,
                    y: sh_pos,
                    w: section.dimensions.width,
                });
                let can_display = true;
                if (pre_ids != null) {
                    const pre_s_length = pre_ids.length;
                    for (let i = 0; i < pre_s_length; i++) {
                        const ps_id = pre_ids[i];
                        const ps_detail = shelfDetails[ps_id];
                        if (!ps_detail)
                            continue;
                        const pre_hs = ps_detail.height_position;
                        if (pre_hs === sh_pos)
                            can_display = false;
                    }
                }
                shelfDetails[shelf.id] = {
                    display: can_display,
                    main_shelf: null,
                    height_position: sh_pos,
                    margin_bottom: mb,
                    height: shelf_dimensions.height,
                    combined: []
                }
                sh_pos += shelf_dimensions.height;
            }

            pre_ids = collect_s_ids;
            x_section += section.dimensions.width;
        }

        const shp_length = sh_positions.length;

        for (let i = 0; i < shp_length; i++) {
            const { x, y, w, id } = sh_positions[i];
            let shelf_x = x;
            let pre_se_w = w;
            for (let j = 0; j < shp_length; j++) {
                const sh_pos = sh_positions[j];
                if (y !== sh_pos.y || sh_positions[i] === sh_pos)
                    continue;
                if (sh_pos.x <= x)
                    continue;
                if (sh_pos.x - pre_se_w !== shelf_x)
                    break;
                pre_se_w = sh_pos.w;
                shelf_x = sh_pos.x;
                if (shelfDetails[id] != null)
                    shelfDetails[id].combined.push(sh_pos.id)
                if (shelfDetails[sh_pos.id] != null)
                    shelfDetails[sh_pos.id].main_shelf = id;
            }
        }
    }
    return shelfDetails;
}

function combinedSectionsReducer(store: PlanogramStore): GroupSectionsState {
    const groupMap: {
        [key: string]: GroupSection
    } = {};
    // const groupShelfves: { [key: string]: PlanogramElementId[] } = {};
    const sectionToGroup: { [key: string]: string } = {};

    for (const aisle of store.aisles) {
        const aisleNumber = aisle.aisle_number.toString();
        let previousGroupSectionId: string | null = null;
        let currentGroupIndex = 0;
        for (let i = 0; i < aisle.sections.length; i++) {
            const section = aisle.sections[i];
            let groupId = aisleNumber + padNumber(currentGroupIndex, 2);
            const shelfHeightId = section.shelves.map(sh => sh.dimensions.height).join("");
            sectionToGroup[section.id] = groupId;
            if (!groupMap[groupId])
                groupMap[groupId] = {
                    group_id: groupId,
                    aisle: aisle.id,
                    aisle_name: aisle.name,
                    shelves: [],
                    sections: []
                };
            if (previousGroupSectionId == null || previousGroupSectionId === shelfHeightId)
                groupMap[groupId].sections.push(section.id)
            else {
                currentGroupIndex++;
                groupId = aisleNumber + padNumber(currentGroupIndex, 2);
                sectionToGroup[section.id] = groupId;
                groupMap[groupId] = {
                    group_id: groupId,
                    aisle: aisle.id,
                    aisle_name: aisle.name,
                    shelves: [],
                    sections: []
                }
                groupMap[groupId].sections.push(section.id);
            }
            // if (!groupShelfves[groupId])
            //     groupShelfves[groupId] = section.shelves.map(sh => sh.id);
            if (groupMap[groupId].shelves.length === 0)
                groupMap[groupId].shelves = section.shelves.map(sh => sh.id);
            previousGroupSectionId = shelfHeightId;
        }
    }
    return {
        // groupSectionMap: groupToSection: groupMap,
        // groupShelfMap: groupShelfves,
        groupMap,
        groupList: Object.keys(groupMap),
        sectionToGroup: sectionToGroup
    }
}

// function roundBy(num: number, by: number): number {
//     return Math.ceil(num / by) * by;
// }