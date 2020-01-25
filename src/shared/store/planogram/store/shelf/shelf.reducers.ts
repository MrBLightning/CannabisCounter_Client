import { PlanogramActions, PlanogramSection } from "../../planogram.types";
import { SHELF_ACTIONS, ShelfActionTypes } from "./shelf.types";
import { itemReducer } from "../item/item.reducers";
import { ITEM_ACTIONS } from "../item/item.types";
import { ShelfDefaultDimension, ItemDefualtPlacement, PLANOGRAM_ID } from "../../planogram.defaults";
import { calculateHeightPosition } from "../store.helper";



export function shelfReducer(state: PlanogramSection, action: PlanogramActions): PlanogramSection {
    switch (action.type) {
        case SHELF_ACTIONS.ADD_SHELF: {
            if (action.section !== state && action.section.id !== state.id)
                return state;
            const newShelfId = state.id + PLANOGRAM_ID.SHELF + (state.shelves.length);
            return {
                ...state,
                shelves: [
                    ...state.shelves,
                    {
                        id: newShelfId,
                        // height_position: null,
                        margin_bottom: null,
                        section_height: null,
                        dimensions: action.dimensions ? action.dimensions : ShelfDefaultDimension,
                        items: action.item ? [{
                            ...action.item,
                            id: newShelfId + PLANOGRAM_ID.ITEM + 0,
                        }] : (action.product ? [{
                            id: newShelfId + PLANOGRAM_ID.ITEM + 0,
                            placement: ItemDefualtPlacement,
                            product: action.product
                        }] : []),
                    }
                ]
            }

        }
        case SHELF_ACTIONS.DUPLICATE_SHELF: {
            if (action.section === state || action.section.id === state.id) {
                const newShelfId = state.id + PLANOGRAM_ID.SHELF + (state.shelves.length);
                return {
                    ...state,
                    shelves: [
                        ...state.shelves.map((sh, i) => ({
                            ...sh,
                            id: state.id + PLANOGRAM_ID.SHELF + i,
                            items: sh.items.map((item, _i) => ({
                                ...item,
                                id: state.id + PLANOGRAM_ID.SHELF + i + PLANOGRAM_ID.ITEM + _i
                            })),
                        })),
                        {
                            ...action.shelf,
                            id: newShelfId,
                            items: action.shelf.items.map((item, _i) => ({
                                ...item,
                                id: newShelfId + PLANOGRAM_ID.ITEM + _i
                            })),
                        }
                    ].map((sh, i, list) => ({
                        ...sh,
                        height_position: calculateHeightPosition(list, i),
                    }))
                }
            }
            return state;
        }
        case SHELF_ACTIONS.DELETE_SHELF: {
            if (action.section === state || action.section.id === state.id)
                return {
                    ...state,
                    shelves: state.shelves
                        .filter((s) => s.id !== action.shelf)
                        .map((sh, i) => ({
                            ...sh,
                            id: state.id + PLANOGRAM_ID.SHELF + i,
                            height_position: calculateHeightPosition(state.shelves, i),
                            items: sh.items.map((item, _i) => ({
                                ...item,
                                id: state.id + PLANOGRAM_ID.SHELF + i + PLANOGRAM_ID.ITEM + _i
                            })),
                        }))
                }
            return state;
        }
        case SHELF_ACTIONS.EDIT_SHELF_DIMENSIONS: {
            if (state.shelves.findIndex((sh) => sh.id === action.shelf) === -1)
                return state;
            return {
                ...state,
                shelves: state.shelves.map((sh, i) => {
                    if (sh.id === action.shelf)
                        return {
                            ...sh,
                            dimensions: action.dimensions
                        };
                    return sh;
                }).map((sh, i, list) => ({
                    ...sh,
                    height_position: calculateHeightPosition(list, i),
                }))
            }
        }
        case ITEM_ACTIONS.ADD_PRODUCT:
        case ITEM_ACTIONS.DELETE_ITEM:
        case ITEM_ACTIONS.DUPLICATE_ITEM:
        case ITEM_ACTIONS.EDIT_ITEM_PLACEMENT:
        case ITEM_ACTIONS.SWITCH_ITEMS:
            return {
                ...state,
                shelves: state.shelves.map(s => itemReducer(s, action))
            }
        default:
            return state;
    }
}
