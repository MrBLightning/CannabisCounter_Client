import * as System from "shared/interfaces/models/System";

export interface SystemDataState {
    branches: System.Branch[],
    suppliers: System.Supplier[],
    groups: System.Group[],
    subGroups: System.SubGroup[],
    classes: System.Class[],
    series: System.Serie[]
    branchesMap: { [key: number]: System.Branch },
    suppliersMap: { [key: number]: System.Supplier },
    groupsMap: { [key: number]: System.Group },
    subGroupsMap: { [key: number]: System.SubGroup },
    classesMap: { [key: number]: System.Class },
    seriesMap: { [key: number]: System.Serie }
}

export enum SYSTEM_DATA_ACTION {
    SET_BRANCHES = "SET_BRANCHES",
    SET_SUPPLIERS = "SET_SUPPLIERS",
    SET_GROUPS = "SET_GROUPS",
    SET_SUBGROUPS = "SET_SUBGROUPS",
    SET_CLASSES = "SET_CLASSES",
    SET_SERIES = "SET_SERIES",
}


export type SetBranchesAction = {
    type: SYSTEM_DATA_ACTION.SET_BRANCHES
    branches: System.Branch[]
};
export type SetSuppliersAction = {
    type: SYSTEM_DATA_ACTION.SET_SUPPLIERS
    suppliers: System.Supplier[]
};
export type SetGroupsAction = {
    type: SYSTEM_DATA_ACTION.SET_GROUPS
    groups: System.Group[]
};
export type SetSubGroupsAction = {
    type: SYSTEM_DATA_ACTION.SET_SUBGROUPS
    subGroups: System.SubGroup[]
};
export type SetClassesAction = {
    type: SYSTEM_DATA_ACTION.SET_CLASSES
    classes: System.Class[]
};
export type SetSeriesAction = {
    type: SYSTEM_DATA_ACTION.SET_SERIES
    series: System.Serie[]
};

export type SystemDataActionTypes = SetBranchesAction | SetSuppliersAction | SetGroupsAction | SetSubGroupsAction | SetClassesAction | SetSeriesAction;