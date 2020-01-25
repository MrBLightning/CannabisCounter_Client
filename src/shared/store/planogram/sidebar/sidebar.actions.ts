import { PlanogramSidebarState, PLANOGRAM_SIDEBAR_ACTIONS, FetchProductsAction, ErrorProductsAction, SetSidebarSearchWordsAction, } from './sidebar.types'


export const fetchSidebarProductsAction = () => (
    {
        type: PLANOGRAM_SIDEBAR_ACTIONS.FETCH_PRODUCTS
    }
)
export const errorSidebarProductsAction = (error: any) => (
    {
        type: PLANOGRAM_SIDEBAR_ACTIONS.ERROR_PRODUCTS,
        error
    }
)
export const setSidebarSearchWords = (searchWords: string) => (
    {
        type: PLANOGRAM_SIDEBAR_ACTIONS.SET_SEARCH_WORDS,
        searchWords
    }
)