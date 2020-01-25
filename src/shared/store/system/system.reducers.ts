import {
    SystemState,
    SystemActions,
    SYSTEM_ACTION
} from './system.types'
import { systemDataReducer, initialSystemData } from './data/data.reducers'

export const initialSystemState: SystemState = {
    init: true,
    app_state: "INIT",
    app_name: "Algoretail",
    app_lang: "he",
    app_version: "v1.0",
    data: initialSystemData,
}

export function systemReducer(state = initialSystemState, action: SystemActions): SystemState {
    switch (action.type) {
        case SYSTEM_ACTION.SET_APP_STATE:
            return {
                ...state,
                app_state: action.state
            }
        case SYSTEM_ACTION.UPDATE_VERSION:
            
            return {
                ...state,
                app_version: action.version
            }
    }
    return {
        ...state,
        data: systemDataReducer(state.data, action)
    }
}