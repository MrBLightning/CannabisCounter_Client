import { ShowSalesReportAction, PLANOGRAM_ACTIONS, HideSalesReportAction, ToggleShelfItemsAction, ToggleBadProductsMarkerAction } from "../planogram.types";

export const showSalesReport = (): ShowSalesReportAction => ({
    type: PLANOGRAM_ACTIONS.SHOW_SALES_REPORT
})
export const hideSalesReport = (): HideSalesReportAction => ({
    type: PLANOGRAM_ACTIONS.HIDE_SALES_REPORT
})
export const toggleShelfItems = (): ToggleShelfItemsAction => ({
    type: PLANOGRAM_ACTIONS.TOGGLE_SHELF_ITEMS
})
export const toggleBadProductsMarker = (): ToggleBadProductsMarkerAction => ({
    type: PLANOGRAM_ACTIONS.TOGGLE_BAD_PRODUCTS_MARKER
})