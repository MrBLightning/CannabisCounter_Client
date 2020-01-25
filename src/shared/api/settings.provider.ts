import { getRequest } from "shared/http";
import * as System from "shared/interfaces/models/System";

export const fetchBranchDetail = async (branchId: number | string): Promise<System.Branch> => {
    const result = await getRequest<{
        status: string,
        branch: System.Branch
    }>('planogram/data/branch/' + branchId);
    return result.branch;
}
export const fetchBranches = async (): Promise<System.Branch[]> => {
    return await getRequest<System.Branch[]>('planogram/data/branches');
}
export const fetchSuppliers = async (): Promise<System.Supplier[]> => {
    return await getRequest<System.Supplier[]>('planogram/data/suppliers');
}
export const fetchGroups = async (): Promise<System.Group[]> => {
    return await getRequest<System.Group[]>('planogram/data/groups');
}
export const fetchSubGroups = async (): Promise<System.SubGroup[]> => {
    return await getRequest<System.SubGroup[]>('planogram/data/subgroups');
}
export const fetchClasses = async (): Promise<System.Class[]> => {
    return await getRequest<System.Class[]>('planogram/data/classes');
}
export const fetchSeries = async (): Promise<System.Serie[]> => {
    return await getRequest<System.Serie[]>('planogram/data/series');
}