import { postRequest, getRequest } from "shared/http";

import LoginResponse from "shared/interfaces/responses/LoginResponse";
import { RbacPermission } from "shared/store/auth/auth.types";

export const loginRequest = async (username: string, password: string): Promise<LoginResponse> => {
    return await postRequest<LoginResponse>('auth/login', { username, password });
}

export const getPermissions = async (): Promise<RbacPermission[]> => {
    console.log('auth.providers getPermissions')
    return await getRequest<RbacPermission[]>('data/rbac');
}