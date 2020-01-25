import { getRequest, postRequest, putRequest, deleteRequest } from "shared/http";
import { Department } from "shared/interfaces/models/SystemModels";

export async function getDepartments(): Promise<Department[]> {
    return await getRequest<Department[]>('/manage/department');
}

export async function addDepartment(Id: number, Name: string) {
    let record = {
        Id: Id, 
        Name: Name
    };
    await postRequest('/manage/department', { record });
}

export async function updateDepartment(Id: number, Name: string) {
    let record = {
        Id: Id, 
        Name: Name
    };
    await putRequest('/manage/department/' + Id, { record });
}

export async function deleteDepartment(Id:number) {
    await deleteRequest('/manage/department/' + Id);
}

// export async function getDepartmentSupps(): Promise<DepartmentSupp[]> {
//     return await getRequest<DepartmentSupp[]>('/departmentsupps');
// }

// export async function addDepartmentSupp(id: number, deptId: number, priority: number, suppId: number, show: number) {
//     let record = {
//         id: id, 
//         deptId: deptId, 
//         priority: priority, 
//         suppId: suppId, 
//         show: show
//     };      
//     await postRequest('/departmentsupp', { record });
// }

// export async function updateDepartmentSupp(id: number, deptId: number, priority: number, suppId: number, show: number) {
//     let record = {
//         id: id, 
//         deptId: deptId, 
//         priority: priority, 
//         suppId: suppId, 
//         show: show
//     };     
//     await putRequest('/departmentsupp/' + id, { record });
// }

// export async function deleteDepartmentSupp(id:number) {
//     await deleteRequest('/departmentsupp/' + id);
// }