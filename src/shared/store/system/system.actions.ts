import { APP_STATE, SYSTEM_ACTION } from "./system.types";

export const setAppState = (state: APP_STATE) => ({
    type: SYSTEM_ACTION.SET_APP_STATE,
    state
})
export const setAppVersion = (version: string) => ({
    type: SYSTEM_ACTION.UPDATE_VERSION,
    version
})