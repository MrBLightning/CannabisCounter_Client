import { PlanogramActions, PlanogramStore } from "../../planogram.types";
import { AISLE_ACTIONS } from "./aisle.types";
import { sectionReducer } from "../section/section.reducers";
import { SECTION_ACTIONS } from "../section/section.types";
import { PLANOGRAM_ID } from "../../planogram.defaults";
import { SHELF_ACTIONS } from "../shelf/shelf.types";
import { ITEM_ACTIONS } from "../item/item.types";

export function aisleReducer(state: PlanogramStore, action: PlanogramActions): PlanogramStore {
    switch (action.type) {
        case AISLE_ACTIONS.ADD_AISLE:
            return {
                ...state,
                // aisle_counter: action.aisle.aisle_number,
                aisles: [
                    ...state.aisles.map((a, i) => ({
                        ...a,
                        index: i,
                        id: PLANOGRAM_ID.AISLE + a.aisle_id
                    })),
                    {
                        ...action.aisle,
                        index: state.aisles.length,
                    }
                ]
            }
        case AISLE_ACTIONS.SET_AISLE:
            return {
                ...state,
                aisles: state.aisles.map((aisle, aisle_index) => ({
                    ...aisle,
                    // ...(aisle.id === action.aisle_pid || aisle.id === action.aisle.id ? action.aisle : aisle),
                    sections: (aisle.id === action.aisle_pid || aisle.id === action.aisle.id ? action.aisle.sections : aisle.sections).map((section, section_index) => ({
                        ...section,
                        shelves: section.shelves.map((shelf, shelf_index) => ({
                            ...shelf,
                            items: shelf.items.map((item, item_index) => ({
                                ...item,
                                id: PLANOGRAM_ID.AISLE + aisle.aisle_id + PLANOGRAM_ID.SECTION + section_index + PLANOGRAM_ID.SHELF + shelf_index + PLANOGRAM_ID.ITEM + item_index
                            })),
                            id: PLANOGRAM_ID.AISLE + aisle.aisle_id + PLANOGRAM_ID.SECTION + section_index + PLANOGRAM_ID.SHELF + shelf_index
                        })),
                        id: PLANOGRAM_ID.AISLE + aisle.aisle_id + PLANOGRAM_ID.SECTION + section_index,
                    })),
                    name: aisle.id === action.aisle_pid || aisle.id === action.aisle.id ? action.aisle.name : aisle.name,
                    aisle_id: aisle.aisle_id,
                    index: aisle_index,
                    id: PLANOGRAM_ID.AISLE + aisle.aisle_id
                }))
            }
        case AISLE_ACTIONS.EDIT_AISLE_NAME:
            return {
                ...state,
                aisles: state.aisles.map((a, i) => action.aisle === a.id ? {
                    ...a,
                    index: i,
                    name: action.name
                } : a)
            }
        case AISLE_ACTIONS.REMOVE_AISLE:
            return {
                ...state,
                aisles: [
                    ...state.aisles.filter((a) => a.id !== action.aisle).map((aisle, aisle_index) => ({
                        ...aisle,
                        sections: aisle.sections.map((section, section_index) => ({
                            ...section,
                            shelves: section.shelves.map((shelf, shelf_index) => ({
                                ...shelf,
                                items: shelf.items.map((item, item_index) => ({
                                    ...item,
                                    id: PLANOGRAM_ID.AISLE + aisle.aisle_id + PLANOGRAM_ID.SECTION + section_index + PLANOGRAM_ID.SHELF + shelf_index + PLANOGRAM_ID.ITEM + item_index
                                })),
                                id: PLANOGRAM_ID.AISLE + aisle.aisle_id + PLANOGRAM_ID.SECTION + section_index + PLANOGRAM_ID.SHELF + shelf_index
                            })),
                            id: PLANOGRAM_ID.AISLE + aisle.aisle_id + PLANOGRAM_ID.SECTION + section_index,
                        })),
                        index: aisle_index,
                        id: PLANOGRAM_ID.AISLE + aisle.aisle_id
                    })),
                ]
            }
        case SECTION_ACTIONS.ADD_SECTION:
        case SECTION_ACTIONS.DELETE_SECTION:
        case SECTION_ACTIONS.DUPLICATE_SECTION:
        case SECTION_ACTIONS.EDIT_SECTION_DIMENSION:
        case SECTION_ACTIONS.SWITCH_SECTIONS:
        case SECTION_ACTIONS.REMOVE_ITEMS:
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
            return {
                ...state,
                aisles: state.aisles.map((a) => sectionReducer(a, action))
            };
        default:
            return state;
    }
}