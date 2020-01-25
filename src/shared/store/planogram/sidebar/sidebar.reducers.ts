import { PlanogramSidebarState, PlanogramSidebarActionTypes, PLANOGRAM_SIDEBAR_ACTIONS } from "./sidebar.types";
import { PlanogramActions } from "../planogram.types";

const initialState: PlanogramSidebarState = {
  searchWords: "",
  // products: [],
}

export function sidebarReducer(state: PlanogramSidebarState = initialState, action: PlanogramActions): PlanogramSidebarState {
  switch (action.type) {
    case PLANOGRAM_SIDEBAR_ACTIONS.SET_SEARCH_WORDS: {
      if (state.searchWords !== action.searchWords)
        return {
          ...state,
          searchWords: action.searchWords
        }
      return state;
    }
    // case PLANOGRAM_SIDEBAR_ACTIONS.EDIT_PRODUCT_DIMENSIONS: {
    //   const products = state.products.map((p) => {
    //     if (p.barcode === action.barcode)
    //       return {
    //         ...p,
    //         dimensions: action.dimensions
    //       }
    //     return p;
    //   });
    //   localStorage.setItem('planogram_catalog', JSON.stringify(products));
    //   return {
    //     ...state,
    //     products
    //   };
    // }
    // case PLANOGRAM_SIDEBAR_ACTIONS.SET_PRODUCTS: {
    //   return {
    //     ...state,
    //     products: action.products
    //   }
    // }
    // case PLANOGRAM_SIDEBAR_ACTIONS.ERROR_PRODUCTS: {
    //   return {
    //     ...state,
    //     error: action.error
    //   }
    // }
    default: {
      return state
    }
  }
}
