import { SystemDataState, SystemDataActionTypes } from "./data/data.types";

export type APP_STATE = "INIT" | "OK" | "NO_NETWORK" | "FATAL_ERROR";

export interface SystemState {
    init: boolean,
    app_state: APP_STATE,
    app_name: string,
    app_lang: string,
    app_version: string,
    data: SystemDataState,
}
export enum SYSTEM_ACTION {
    INIT_FETCH = "INIT_FETCH",
    SET_APP_STATE = "SET_APP_STATE",
    UPDATE_VERSION = "UPDATE_VERSION"
}

export type SetAppStateAction = {
    type: SYSTEM_ACTION.SET_APP_STATE,
    state: APP_STATE
}
export type UpdateAppVersionAction = {
    type: SYSTEM_ACTION.UPDATE_VERSION,
    version: string
}

export type SystemActions = SetAppStateAction | SystemDataActionTypes | UpdateAppVersionAction