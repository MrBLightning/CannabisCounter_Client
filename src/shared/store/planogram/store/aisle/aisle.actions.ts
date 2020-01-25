import { AISLE_ACTIONS, addAisleActionType, removeAisleActionType, editAisleNameActionType, setAisleActionType } from "./aisle.types";
import { PlanogramAisle, PlanogramElementId } from 'shared/store/planogram/planogram.types'

export function addAisleAction(aisle: PlanogramAisle): addAisleActionType {
    return {
        type: AISLE_ACTIONS.ADD_AISLE,
        aisle
    }
}
export function removeAisleAction(aisle: PlanogramElementId): removeAisleActionType {
    return {
        type: AISLE_ACTIONS.REMOVE_AISLE,
        aisle,
    }
}
export function editAisleName(aisle: PlanogramElementId, name: string): editAisleNameActionType {
    return {
        type: AISLE_ACTIONS.EDIT_AISLE_NAME,
        aisle,
        name,
    }
}
export function setAisleAction(aisle: PlanogramAisle, aisle_pid?: PlanogramElementId): setAisleActionType {
    return {
        type: AISLE_ACTIONS.SET_AISLE,
        aisle,
        aisle_pid
    }
}