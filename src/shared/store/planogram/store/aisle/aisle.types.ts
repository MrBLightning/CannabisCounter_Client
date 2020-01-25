import { PlanogramAisle, PlanogramElementId } from "../../planogram.types";

export enum AISLE_ACTIONS {
    ADD_AISLE = "ADD_AISLE",
    REMOVE_AISLE = "REMOVE_AISLE",
    ADD_SECTION = "ADD_SECTION",
    EDIT_AISLE_NAME = "EDIT_AISLE_NAME",
    SET_AISLE = "SET_AISLE"
}

export type AisleId = number;

export type addAisleActionType = {
    type: AISLE_ACTIONS.ADD_AISLE,
    aisle: PlanogramAisle
};
export type removeAisleActionType = {
    type: AISLE_ACTIONS.REMOVE_AISLE,
    aisle:PlanogramElementId
};
export type addSectionActionType = {
    type: AISLE_ACTIONS.ADD_SECTION,
    aisle:PlanogramElementId
};
export type editAisleNameActionType = {
    type: AISLE_ACTIONS.EDIT_AISLE_NAME,
    aisle:PlanogramElementId,
    name: string
};
export type setAisleActionType = {
    type: AISLE_ACTIONS.SET_AISLE,
    aisle: PlanogramAisle,
    aisle_pid?: PlanogramElementId
};

export type AisleActionTypes = setAisleActionType | editAisleNameActionType | addAisleActionType | addSectionActionType | removeAisleActionType;
