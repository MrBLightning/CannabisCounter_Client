import { PlanogramActions, PlanogramState, PLANOGRAM_ACTIONS } from "../planogram.types";
import { ProductDetailState } from "./product-details.type";
import { shelfItemMaxAmount } from "pages/manage/planogram/provider/calculation.service";
import { STORE_ACTIONS } from "../store/store.types";
import { AISLE_ACTIONS } from "../store/aisle/aisle.types";
import { SECTION_ACTIONS } from "../store/section/section.types";
import { SHELF_ACTIONS } from "../store/shelf/shelf.types";
import { ITEM_ACTIONS } from "../store/item/item.types";

export function productDetailReducer(state: PlanogramState, action: PlanogramActions): ProductDetailState {
    switch (action.type) {
        case STORE_ACTIONS.SET_VIEW:
        case PLANOGRAM_ACTIONS.SET_DISPLAY_AISLE:
        case AISLE_ACTIONS.ADD_AISLE:
        case AISLE_ACTIONS.SET_AISLE:
        case AISLE_ACTIONS.ADD_SECTION:
        case AISLE_ACTIONS.EDIT_AISLE_NAME:
        case AISLE_ACTIONS.REMOVE_AISLE:
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
            if (state.store == null) return state.productDetails;
            const newState: ProductDetailState = {}
            for (const aisle of state.store.aisles) {
                for (const section of aisle.sections) {
                    for (const shelf of section.shelves) {
                        for (let i = 0; i < shelf.items.length; i++) {
                            const item = shelf.items[i];
                            if (!newState[item.product])
                                newState[item.product] = {
                                    maxAmount: 0,
                                    facesCount: 0,
                                    position: []
                                };
                            newState[item.product].position.push({
                                aisle_id: aisle.aisle_id,
                                section: section.id,
                                shelf: shelf.id,
                                itemIndex: i
                            })
                            newState[item.product].maxAmount += shelfItemMaxAmount(item.placement);
                            newState[item.product].facesCount += item.placement.faces * item.placement.stack;
                        }
                    }
                }
            }
            return newState;
        default:
            return state.productDetails;
    }
}

