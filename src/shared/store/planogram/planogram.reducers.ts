import { storeReducer } from './store/store.reducers';
import { sidebarReducer } from './sidebar/sidebar.reducers';
import { productDetailReducer } from './product-details/product-details.reducer';
import { PlanogramState, PlanogramActions } from './planogram.types';
import { virtualizeReducer, initialVirtualStoreState } from './virtualize/virtualize.reducer';
import { initialDisplayState, planogramDisplayReducer } from './display/display.reducer';
import { AppState } from '../app.reducer';

export const intitialPlanogramState: PlanogramState = {
    sidebar: {},
    display: initialDisplayState,
    store: null,
    // storeList: [],
    productDetails: {},
    virtualStore: initialVirtualStoreState
}


export const planogramReducer = (state: AppState, action: PlanogramActions): PlanogramState => {
    const newState: AppState = {
        ...state,
        planogram: {
            ...state.planogram,
            display: planogramDisplayReducer(state.planogram.display, action),
            sidebar: sidebarReducer(state.planogram.sidebar, action),
            store: storeReducer(state, action),
            // storeList: storeListReducer(state.storeList, action),
            // productDetails: productDetailReducer(state, action)
        }
    };
    newState.planogram.virtualStore = virtualizeReducer(newState, action);
    newState.planogram.productDetails = productDetailReducer(newState.planogram, action);
    return newState.planogram;
}
