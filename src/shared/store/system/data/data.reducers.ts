
import { Reducer } from 'redux'
import { SystemDataState, SYSTEM_DATA_ACTION, SystemDataActionTypes } from './data.types'
import { toMap } from 'shared/store/catalog/catalog.reducer'

export const initialSystemData: SystemDataState = {
    branches: [],
    branchesMap: {},
    suppliers: [],
    suppliersMap: {},
    classes: [],
    classesMap: {},
    groups: [],
    groupsMap: {},
    subGroups: [],
    subGroupsMap: {},
    series: [],
    seriesMap: {}
}

export const systemDataReducer: Reducer<SystemDataState, SystemDataActionTypes> = (state = initialSystemData, action) => {
    switch (action.type) {
        case SYSTEM_DATA_ACTION.SET_BRANCHES:
            return {
                ...state,
                branches: action.branches,
                branchesMap: toMap(action.branches, "BranchId")
            }
        case SYSTEM_DATA_ACTION.SET_SUPPLIERS:
            return {
                ...state,
                suppliers: action.suppliers,
                suppliersMap: toMap(action.suppliers, "Id")
            }
        case SYSTEM_DATA_ACTION.SET_GROUPS:
            return {
                ...state,
                groups: action.groups,
                groupsMap: toMap(action.groups, "Id")
            }
        case SYSTEM_DATA_ACTION.SET_SUBGROUPS:
            return {
                ...state,
                subGroups: action.subGroups,
                subGroupsMap: toMap(action.subGroups, "Id")
            }
        case SYSTEM_DATA_ACTION.SET_CLASSES:
            return {
                ...state,
                classes: action.classes,
                classesMap: toMap(action.classes, "Id")
            }
        case SYSTEM_DATA_ACTION.SET_SERIES:
            return {
                ...state,
                series: action.series,
                seriesMap: toMap(action.series, "Id")
            }

        default:
            return state
    }
}
