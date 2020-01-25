import { PlanogramActions, PlanogramAisle, PlanogramShelf, PlanogramItem } from "../../planogram.types";
import { SECTION_ACTIONS } from "./section.types";
import { shelfReducer } from "../shelf/shelf.reducers";
import { SHELF_ACTIONS } from "../shelf/shelf.types";
import { ItemDefualtPlacement, SectionDefaultDimension, ShelfDefaultDimension, PLANOGRAM_ID } from "../../planogram.defaults";
import { ITEM_ACTIONS } from "../item/item.types";

export function sectionReducer(state: PlanogramAisle, action: PlanogramActions): PlanogramAisle {
    switch (action.type) {
        case SECTION_ACTIONS.ADD_SECTION: {
            if (action.aisle !== state.id)
                return state;
            const sectionId = state.id + PLANOGRAM_ID.SECTION + (state.sections.length);
            return {
                ...state,
                sections: [
                    ...state.sections,
                    {
                        id: sectionId,
                        dimensions: action.dimensions || SectionDefaultDimension,
                        shelves: action.shelf || action.product ?
                            (action.shelf ? [{
                                dimensions: ShelfDefaultDimension,
                                ...action.shelf,
                                // height_position: heightPosition(0, action.shelf.dimensions ? action.shelf.dimensions.height : ShelfDefaultDimension.height),
                                items: action.shelf.items ? action.shelf.items.map((item, i) => ({
                                    ...item,
                                    id: sectionId + PLANOGRAM_ID.SHELF + "0" + PLANOGRAM_ID.ITEM + i
                                })) : [],
                                id: sectionId + PLANOGRAM_ID.SHELF + "0",
                            }] : (action.product ? [{
                                id: sectionId + PLANOGRAM_ID.SHELF + "0",
                                dimensions: ShelfDefaultDimension,
                                margin_bottom: 0,
                                section_height: 0,
                                // height_position: heightPosition(0, ShelfDefaultDimension.height),
                                items: [{
                                    id: sectionId + PLANOGRAM_ID.SHELF + "0" + PLANOGRAM_ID.ITEM + "0",
                                    placement: ItemDefualtPlacement,
                                    product: action.product,
                                }]
                            }] : [])) : [],
                    }
                ]
            }
        }
        case SECTION_ACTIONS.DUPLICATE_SECTION: {
            if (action.aisle !== state.id)
                return state;
            const aisleId = state.id;
            return {
                ...state,
                sections: [
                    ...state.sections,
                    {
                        ...action.section,
                        id: aisleId + PLANOGRAM_ID.SECTION + state.sections.length
                    }
                ].map((s, i) => ({
                    ...s,
                    shelves: s.shelves.map((sh, _i) => ({
                        ...sh,
                        items: sh.items.map((item, __i) => ({
                            ...item,
                            id: aisleId + PLANOGRAM_ID.SECTION + i + PLANOGRAM_ID.SHELF + _i + PLANOGRAM_ID.ITEM + __i
                        })),
                        // height_position: calculateHeightPosition(s.shelves, _i),
                        id: aisleId + PLANOGRAM_ID.SECTION + i + PLANOGRAM_ID.SHELF + _i
                    })),
                    id: aisleId + PLANOGRAM_ID.SECTION + i
                }))
            }
        }
        case SECTION_ACTIONS.DELETE_SECTION: {
            if (action.aisle !== state.id)
                return state;
            const sectionIndex = state.sections.findIndex(s => s === action.section || s.id === action.section.id);
            if (sectionIndex === -1)
                return state;
            return {
                ...state,
                sections: [
                    ...state.sections.slice(0, sectionIndex),
                    ...state.sections.slice(sectionIndex + 1),
                ].map((s, i) => ({
                    ...s,
                    id: state.id + PLANOGRAM_ID.SECTION + i
                })),
            };
        }
        case SECTION_ACTIONS.EDIT_SECTION_DIMENSION: {
            return {
                ...state,
                sections: state.sections.map((s, i) => {
                    if (s === action.section || s.id === action.section.id)
                        return {
                            ...s,
                            dimensions: action.dimension
                        };
                    return s
                }),
            };
        }
        case SECTION_ACTIONS.SWITCH_SECTIONS: {
            let baseIndex = state.sections.findIndex(se => se.id === action.base.id);
            let remoteIndex = state.sections.findIndex(se => se.id === action.remote.id);
            if (baseIndex === -1 || remoteIndex === -1)
                return state;
            const sections = [...state.sections];
            [sections[baseIndex], sections[remoteIndex]] = [sections[remoteIndex], sections[baseIndex]];
            return {
                ...state,
                sections: sections.map((s, i) => ({
                    ...s,
                    shelves: s.shelves.map((sh, _i) => ({
                        ...sh,
                        items: sh.items.map((item, __i) => ({
                            ...item,
                            id: state.id + PLANOGRAM_ID.SECTION + i + PLANOGRAM_ID.SHELF + _i + PLANOGRAM_ID.ITEM + __i
                        })),
                        id: state.id + PLANOGRAM_ID.SECTION + i + PLANOGRAM_ID.SHELF + _i
                    })),
                    id: state.id + PLANOGRAM_ID.SECTION + i
                }))
            }
        }
        case SECTION_ACTIONS.REMOVE_ITEMS: {
            if (action.aisle !== state.id)
                return state;
            const sectionId: string = action.section;
            return {
                ...state,
                sections: state.sections.map((s, i) => ({
                    ...s,
                    shelves: s.shelves.map((sh, _i) => ({
                        ...sh,
                        items: sectionId === s.id ? [] : sh.items.map((item, __i) => ({
                            ...item,
                            id: state.id + PLANOGRAM_ID.SECTION + i + PLANOGRAM_ID.SHELF + _i + PLANOGRAM_ID.ITEM + __i
                        })),
                        id: state.id + PLANOGRAM_ID.SECTION + i + PLANOGRAM_ID.SHELF + _i
                    })),
                    id: state.id + PLANOGRAM_ID.SECTION + i
                }))
            }
        }
        case SHELF_ACTIONS.SWITCH_SHELVES: {
            const base = action.shelf;
            const remote = action.remote;
            if (base === remote)
                return state;

            let baseShelf: PlanogramShelf | null = null;
            let remoteShelf: PlanogramShelf | null = null;

            for (let i = 0; i < state.sections.length; i++) {
                const section = state.sections[i];
                for (let k = 0; k < section.shelves.length; k++) {
                    const shelf = section.shelves[k];
                    if (base === shelf.id) {
                        baseShelf = shelf;
                    }
                    else if (remote === shelf.id) {
                        remoteShelf = shelf;
                    }
                }
            }
            if (!baseShelf || !remoteShelf)
                return state;

            return {
                ...state,
                sections: state.sections.map((se, i) => ({
                    ...se,
                    shelves: se.shelves.map((sh, _i) => ({
                        ...sh,
                        ...(sh.id === base ? remoteShelf : (sh.id === remote ? baseShelf : sh)),
                        id: se.id + PLANOGRAM_ID.SHELF + _i,
                        items: (sh.id === base && remoteShelf ? remoteShelf.items : (sh.id === remote && baseShelf ? baseShelf.items : sh.items)).map((item, __i) => ({
                            ...item,
                            id: se.id + PLANOGRAM_ID.SHELF + _i + PLANOGRAM_ID.ITEM + __i
                        }))
                    }))
                }))
            }
        }
        case ITEM_ACTIONS.SWITCH_ITEMS: {
            const base = action.item;
            const remote = action.remote;
            if (base === remote)
                return state;

            let baseItem: PlanogramItem | null = null;
            let remoteItem: PlanogramItem | null = null;
            for (let i = 0; i < state.sections.length; i++) {
                const section = state.sections[i];
                for (let k = 0; k < section.shelves.length; k++) {
                    const items = section.shelves[k].items;
                    for (let j = 0; j < items.length; j++) {
                        if (base === items[j].id)
                            baseItem = items[j];
                        else if (remote === items[j].id)
                            remoteItem = items[j];
                    }
                }
            }
            if (baseItem == null || remoteItem == null)
                return state;

            return {
                ...state,
                sections: state.sections.map((se) => ({
                    ...se,
                    shelves: se.shelves.map((sh) => ({
                        ...sh,
                        items: sh.items.map((item, __i) => ({
                            ...item,
                            ...(item.id === base ? remoteItem : (item.id === remote ? baseItem : item)),
                            id: sh.id + PLANOGRAM_ID.ITEM + __i
                        }))
                    }))
                }))
            }
        }
        case SHELF_ACTIONS.ADD_SHELF:
        case SHELF_ACTIONS.DELETE_SHELF:
        case SHELF_ACTIONS.DUPLICATE_SHELF:
        case SHELF_ACTIONS.EDIT_SHELF_DIMENSIONS:
        case ITEM_ACTIONS.ADD_PRODUCT:
        case ITEM_ACTIONS.DELETE_ITEM:
        case ITEM_ACTIONS.DUPLICATE_ITEM:
        case ITEM_ACTIONS.EDIT_ITEM_PLACEMENT:
            return {
                ...state,
                sections: state.sections.map((s) => shelfReducer(s, action))
            }
        default:
            return state;
    }
}