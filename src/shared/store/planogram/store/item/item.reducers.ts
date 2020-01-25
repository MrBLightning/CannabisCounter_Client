import { PlanogramActions, PlanogramShelf, PlanogramItem } from "../../planogram.types";
import { ITEM_ACTIONS } from "./item.types";
import { PLANOGRAM_ID } from "../../planogram.defaults";

export function itemReducer(state: PlanogramShelf, action: PlanogramActions): PlanogramShelf {
    switch (action.type) {
        case ITEM_ACTIONS.ADD_PRODUCT: {
            if (state.id === action.shelf) {
                return {
                    ...state,
                    items: [
                        ...state.items.map((item, i) => ({
                            ...item,
                            id: state.id + PLANOGRAM_ID.ITEM + i
                        })),
                        {
                            id: state.id + PLANOGRAM_ID.ITEM + state.items.length,
                            placement: action.placement || {
                                faces: 1,
                                row: 1,
                                stack: 1,
                                manual_row_only: 0
                            },
                            product: action.product,
                        }
                    ]
                }
            }
            return state;
        }
        // case ITEM_ACTIONS.SWITCH_ITEMS: {
        //     if (state.id === action.shelf) {
        //         const items = state.items;
        //         const base = action.item;
        //         const remote = action.remote;
        //         const baseIndex = items.findIndex(s => base === s || base.id === s.id);
        //         const remoteIndex = items.findIndex(s => remote === s || remote.id === s.id);
        //         if (baseIndex === -1 || remoteIndex === -1) {
        //             return state;
        //         }
        //         const _items = [...items];
        //         [_items[baseIndex], _items[remoteIndex]] = [remote, base];

        //         return {
        //             ...state,
        //             items: _items.map((item, i) => ({
        //                 ...item,
        //                 id: state.id + PLANOGRAM_ID.ITEM + i
        //             }))
        //         }
        //     }
        //     return state;
        // }
        case ITEM_ACTIONS.DUPLICATE_ITEM: {
            if (state.id === action.shelf) {
                return {
                    ...state,
                    items: [
                        ...state.items.map((item, i) => ({
                            ...item,
                            id: state.id + PLANOGRAM_ID.ITEM + i
                        })),
                        {
                            ...action.item,
                            id: state.id + PLANOGRAM_ID.ITEM + (state.items.length),
                        }
                    ]
                }
            }
            return state;
        }
        case ITEM_ACTIONS.DELETE_ITEM: {
            // if (state.id === action.shelf) {
            const itemIndex = state.items.findIndex(s => s.id === action.item);
            if (itemIndex === -1)
                return state;
            return {
                ...state,
                items: [
                    ...state.items.slice(0, itemIndex),
                    ...state.items.slice(itemIndex + 1),
                ].map((item, i) => ({
                    ...item,
                    id: state.id + PLANOGRAM_ID.ITEM + i
                }))
            }
        }
        case ITEM_ACTIONS.EDIT_ITEM_PLACEMENT: {
            const exists = state.items.findIndex(item => item.id === action.item);
            if (exists === -1)
                return state;
            return {
                ...state,
                items: state.items.map((item, i) => {
                    if (item.id === action.item)
                        return {
                            ...item,
                            barcode: action.barcode || item.product,
                            placement: action.placement
                        }
                    return item
                })
            }
        }
        default:
            return state;
    }
}
