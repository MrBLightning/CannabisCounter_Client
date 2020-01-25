export type PlanogramSidebarState = {
    searchWords?: string,
    // products: SidebarProduct[],
    error?: any
}

export enum PLANOGRAM_SIDEBAR_ACTIONS {
    FETCH_PRODUCTS = "FETCH_PRODUCTS",
    ERROR_PRODUCTS = "ERROR_PRODUCTS",
    SET_SEARCH_WORDS="SET_SEARCH_WORDS"
}

export interface SetSidebarSearchWordsAction {
    type: PLANOGRAM_SIDEBAR_ACTIONS.SET_SEARCH_WORDS
    searchWords: string
}
export interface FetchProductsAction {
    type: PLANOGRAM_SIDEBAR_ACTIONS.FETCH_PRODUCTS
}
export interface ErrorProductsAction {
    type: PLANOGRAM_SIDEBAR_ACTIONS.ERROR_PRODUCTS
    error: any
}

export type PlanogramSidebarActionTypes = ErrorProductsAction | FetchProductsAction | SetSidebarSearchWordsAction;
