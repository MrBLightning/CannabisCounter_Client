import { Branch, Supplier, Group, Class, Serie, SubGroup } from "shared/interfaces/models/System";
import { SetBranchesAction, SYSTEM_DATA_ACTION, SetSuppliersAction, SetGroupsAction, SetClassesAction, SetSeriesAction, SetSubGroupsAction } from "./data.types";

export const setBranches = (branches: Branch[]): SetBranchesAction => ({
    type: SYSTEM_DATA_ACTION.SET_BRANCHES,
    branches
});
export const setSuppliers = (suppliers: Supplier[]): SetSuppliersAction => ({
    type: SYSTEM_DATA_ACTION.SET_SUPPLIERS,
    suppliers
});
export const setGroups = (groups: Group[]): SetGroupsAction => ({
    type: SYSTEM_DATA_ACTION.SET_GROUPS,
    groups
});
export const setSubGroups = (subGroups: SubGroup[]): SetSubGroupsAction => ({
    type: SYSTEM_DATA_ACTION.SET_SUBGROUPS,
    subGroups
});
export const setClasses = (classes: Class[]): SetClassesAction => ({
    type: SYSTEM_DATA_ACTION.SET_CLASSES,
    classes
});
export const setSeries = (series: Serie[]): SetSeriesAction => ({
    type: SYSTEM_DATA_ACTION.SET_SERIES,
    series
});