import { AuthUser } from "shared/interfaces/models/User";
import { AUTH_ACTION, SetUserAction, LogoutAction, SetAuthAction, RemoveAuthAction, SetExpDateAction, RbacPermission, SetPermissionsAction } from "./auth.types";

export const setAuth = (user: AuthUser, token: string, exp_date: number, permissions: RbacPermission[]): SetAuthAction => ({
    type: AUTH_ACTION.SET_AUTH,
    user: user,
    token: token,
    exp_date: exp_date,
    permissions: permissions
})
export const removeAuth = (): RemoveAuthAction => ({
    type: AUTH_ACTION.REMOVE_AUTH,
})
export const setUser = (user?: AuthUser): SetUserAction => ({
    type: AUTH_ACTION.SET_USER,
    user: user
})
export const setExpDate = (exp_date?: number): SetExpDateAction => ({
    type: AUTH_ACTION.SET_EXP_DATE,
    exp_date: exp_date
})
export const setPermissions = (permissions: RbacPermission[]): SetPermissionsAction => ({
    type: AUTH_ACTION.SET_PERMISSIONS,
    permissions: permissions
})
export const logoutRedux = (): LogoutAction => ({
    type: AUTH_ACTION.LOGOUT
})
