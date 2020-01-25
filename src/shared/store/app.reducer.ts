import { planogramReducer, intitialPlanogramState } from './planogram/planogram.reducers'
import { systemReducer, initialSystemState } from './system/system.reducers'
import { combineReducers, Reducer } from 'redux';
import { catalogReducer, initialCatalogState } from './catalog/catalog.reducer';
import { authReducer, initialAuthState } from './auth/auth.reducer';
import { SystemActions } from './system/system.types';
import { AuthActions } from './auth/auth.types';
import { PlanogramActions } from './planogram/planogram.types';
import { CatalogActions } from './catalog/catalog.types';

// export const rootReducer = combineReducers({
//     auth: authReducer,
//     system: systemReducer,
//     planogram: planogramReducer,
//     catalog: catalogReducer
// })
// export type AppState = ReturnType<typeof rootReducer>

export type AppState = {
    auth: ReturnType<typeof authReducer>,
    system: ReturnType<typeof systemReducer>,
    planogram: ReturnType<typeof planogramReducer>,
    catalog: ReturnType<typeof catalogReducer>
}

export const initialAppState: AppState = {
    auth: initialAuthState,
    catalog: initialCatalogState,
    system: initialSystemState,
    planogram: intitialPlanogramState
}

export type AppAction = AuthActions & SystemActions & PlanogramActions & CatalogActions;

export const rootReducer: Reducer<AppState, AppAction> = (state = initialAppState, action) => ({
    auth: authReducer(state.auth, action),
    system: systemReducer(state.system, action),
    planogram: planogramReducer(state, action),
    catalog: catalogReducer(state.catalog, action)
})
