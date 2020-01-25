import { PlanogramState, PlanogramActions, PLANOGRAM_ACTIONS } from "../planogram.types"
import { Reducer } from "redux"
import { PlanogramDisplayState } from "./display.types"

export const initialDisplayState: PlanogramDisplayState = {
    aisleIndex: 0,
    hideShelfItems: false,
    showRowItems: false,
    showSettings: false,
    markBadProducts: true,
    displaySalesReport: false,
    productDetailer: null,
    colorBy: null
}

export const planogramDisplayReducer: Reducer<PlanogramDisplayState, PlanogramActions> = (state = initialDisplayState, action) => {
    if (action.type === PLANOGRAM_ACTIONS.SET_DISPLAY_AISLE) {
        if (state.aisleIndex === action.aisleIndex)
            return state;
        return {
            ...state,
            aisleIndex: action.aisleIndex
            // virtualStore: virtualizeReducer(state.store ? state.store.aisles[action.aisleIndex] : undefined, action)
        }
    }
    else if (action.type === PLANOGRAM_ACTIONS.SHOW_SALES_REPORT) {
        return {
            ...state,
            displaySalesReport: true
        }
    }
    else if (action.type === PLANOGRAM_ACTIONS.HIDE_SALES_REPORT) {
        return {
            ...state,
            displaySalesReport: false
        }
    }
    else if (action.type === PLANOGRAM_ACTIONS.SET_PRODUCT_DETAILER) {
        if (state.productDetailer === action.barcode)
            return state;
        return {
            ...state,
            productDetailer: action.barcode
        }
    }
    else if (action.type === PLANOGRAM_ACTIONS.HIDE_PRODUCT_DETAILER) {
        if (state.productDetailer === null)
            return state;
        return {
            ...state,
            productDetailer: null
        }
    }
    else if (action.type === PLANOGRAM_ACTIONS.COLOR_BY) {
        return {
            ...state,
            colorBy: action.color_by
        }
    }
    else if (action.type === PLANOGRAM_ACTIONS.TOGGLE_SHELF_ITEMS) {
        return {
            ...state,
            hideShelfItems: !state.hideShelfItems,
        }
    }
    else if (action.type === PLANOGRAM_ACTIONS.TOGGLE_ROW_ITEMS) {
        return {
            ...state,
            showRowItems: !state.showRowItems,
        }
    }
    else if (action.type === PLANOGRAM_ACTIONS.TOGGLE_SETTINGS) {
        return {
            ...state,
            showSettings: !state.showSettings
        }
    }
    else if (action.type === PLANOGRAM_ACTIONS.TOGGLE_BAD_PRODUCTS_MARKER) {
        return {
            ...state,
            markBadProducts: !state.markBadProducts
        }
    }


    return state;
}