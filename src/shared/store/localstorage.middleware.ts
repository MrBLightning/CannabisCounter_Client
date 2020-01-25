import { Middleware } from "redux";

export enum STORAGE_ACTION {
    SAVE = "SAVE",
    LOAD = "LOAD"
}

export type SaveActionType = {
    type: STORAGE_ACTION.SAVE,
    key: string,
    payload: string | Buffer,
}
export type LoadActionType = {
    type: STORAGE_ACTION.LOAD,
    key: string,
}

export const localStorageMiddleware: Middleware = (store) => (next) => (action) => {
    if (action.type === STORAGE_ACTION.SAVE) {
        if (typeof action.payload === "string" || action.payload instanceof Buffer)
            localStorage.setItem(action.key, action.payload);
    }
    return next(action);
}