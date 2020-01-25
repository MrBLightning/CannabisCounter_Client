import { PlanogramStore } from "../planogram.types";
import { SectionActionTypes } from "./section/section.types";

export type PlanogramViewState = PlanogramStore | null;

export enum STORE_ACTIONS {
    INIT_FETCH = 'INIT_FETCH',
    SET_VIEW = "SET_VIEW",
    SET_ERROR = "SET_ERROR",
    RENAME = "RENAME"
}

export type InitViewActionType = {
    type: STORE_ACTIONS.INIT_FETCH
};
export type SetViewActionType = {
    type: STORE_ACTIONS.SET_VIEW,
    store: PlanogramStore | null
};
export type SetErrorActionType = {
    type: STORE_ACTIONS.SET_ERROR,
    error: any
};
export type RenameStoreActionType = {
    type: STORE_ACTIONS.RENAME,
    name: string
};

export type PlanogramViewActionTypes = SetErrorActionType | SetViewActionType | InitViewActionType | SectionActionTypes | RenameStoreActionType;
