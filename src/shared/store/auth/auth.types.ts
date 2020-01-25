import { User, AuthUser } from "shared/interfaces/models/User";
import { AnyAction } from "redux";


export type AuthState = {
    user?: AuthUser,
    token?: string,
    refresh_token?: string,
    exp_date?: number,
    permissions?:RbacPermission[]
}

export type RbacPermissionTask = {
    read: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
}

export type RbacPermission = {
    action: string;
} & RbacPermissionTask;

export enum AUTH_ACTION {
    SET_USER = "SET_USER",
    LOGOUT = "LOGOUT",
    SET_TOKEN = "SET_TOKEN",
    SET_AUTH = "SET_AUTH",
    SET_EXP_DATE = "SET_EXP_DATE",
    SET_PERMISSIONS = "SET_PERMISSIONS",
    REMOVE_AUTH = "REMOVE_AUTH",
}

export type RemoveAuthAction = {
    type: AUTH_ACTION.REMOVE_AUTH,
}
export type SetAuthAction = {
    type: AUTH_ACTION.SET_AUTH,
    token?: string,
    user?: AuthUser,
    exp_date?: number,
    permissions?:RbacPermission[]
}
export type SetTokenAction = {
    type: AUTH_ACTION.SET_TOKEN,
    token?: string
}
export type SetUserAction = {
    type: AUTH_ACTION.SET_USER,
    user?: AuthUser
}
export type SetExpDateAction = {
    type: AUTH_ACTION.SET_EXP_DATE,
    exp_date?: number
}
export type SetPermissionsAction = {
    type: AUTH_ACTION.SET_PERMISSIONS,
    permissions?:RbacPermission[]
}
export type LogoutAction = {
    type: AUTH_ACTION.LOGOUT
}

export type AuthActions = SetUserAction | LogoutAction | SetTokenAction | SetAuthAction | SetExpDateAction | SetPermissionsAction | RemoveAuthAction;