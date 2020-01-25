import { STORE_ACTIONS, SetViewActionType, SetErrorActionType, InitViewActionType, RenameStoreActionType } from './store.types'
import { PlanogramStore } from '../planogram.types';
// import { initialStore, emptyStore } from './store.defaults';
import { STORAGE_ACTION, SaveActionType } from '../../localstorage.middleware';

export function resetStore(branchId: number): SetViewActionType {
    return {
        type: STORE_ACTIONS.SET_VIEW,
        store: null
    }
}
export function renameStore(name: string): RenameStoreActionType {
    return {
        type: STORE_ACTIONS.RENAME,
        name
    }
}
export function saveStore(store: PlanogramStore): SaveActionType {
    return {
        type: STORAGE_ACTION.SAVE,
        key: 'planogram',
        payload: JSON.stringify(store)
    }
}
export function saveLocalStore(store: PlanogramStore): SaveActionType {
    return {
        type: STORAGE_ACTION.SAVE,
        key: 'planogram_local',
        payload: JSON.stringify(store)
    }
}
export function loadStore(store?: PlanogramStore): InitViewActionType {
    return {
        type: STORE_ACTIONS.INIT_FETCH,
    }
}
export function setStore(store: PlanogramStore | null): SetViewActionType {
    return {
        type: STORE_ACTIONS.SET_VIEW,
        store
    }
}
export function errorPlanogramView(error: any): SetErrorActionType {
    return {
        type: STORE_ACTIONS.SET_ERROR,
        error
    }
}