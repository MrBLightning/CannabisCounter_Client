import { AuthUser } from "../interfaces/models/User";
import { loginRequest, getPermissions } from "shared/api/auth.provider";
import { getRequest } from "shared/http";
import { setAuth, removeAuth, setExpDate } from "shared/store/auth/auth.actions";
import { store } from "shared/store";
import { setAppState } from "shared/store/system/system.actions";
import { unregister } from "serviceWorker";
import { RbacPermission } from "shared/store/auth/auth.types";

const LOCAL_TOKEN_PREFIX = "user_token";
const LOCAL_USER_PREFIX = "user";
const LOCAL_REFRESH_TOKEN = "refresh_token";
const LOCAL_EXP_DATE_PREFIX = "exp_date";
const LOCAL_PERMISSIONS = "permissions";

const defaultPermission:RbacPermission = {
  action: "",
  read: true,
  create: true,
  edit: true,
  delete: true,
}

export async function login(username: string, password: string) {
  try {
    const response = await loginRequest(username, password);
    saveAccessToken(response.access_token);
    saveUser(response.user);
    saveExpDate(response.exp_date + '');
    console.log('access_token',response.access_token,'user',response.user,'exp_date',new Date(response.exp_date));
    // exp_date comes in epoch time and we convert it to string for saving
    let permissions: RbacPermission[] = [];
    // if (response.user.role != 'super_admin') permissions = await getPermissions();
    if (response.user && response.user.role != 'super_admin' && response.user.permissions && response.user.permissions.length >= 0) 
      permissions = response.user.permissions;
    console.log('auth permissions',permissions);
    savePermissions(permissions);
    store.dispatch(setAuth(response.user, response.access_token, response.exp_date, permissions));
    return true;
  } catch (error) {
    console.error(error);
  }
  throw new Error("Invalid credentials");
}

export function logout() {
  localStorage.removeItem(LOCAL_TOKEN_PREFIX);
  localStorage.removeItem(LOCAL_USER_PREFIX);
  localStorage.removeItem(LOCAL_EXP_DATE_PREFIX);
  localStorage.removeItem(LOCAL_PERMISSIONS);
  store.dispatch(removeAuth());
}

export function refresh() {
  unregister();
  window.location.reload(true);
}

export function getPermission(action:string, permissions?:RbacPermission[]):RbacPermission{
  let actionPermission = defaultPermission;
  if(permissions) actionPermission = permissions.filter(permiss => permiss.action === action)[0];
  if(actionPermission === undefined) actionPermission = defaultPermission;
  return actionPermission;
}

export const init = async (): Promise<void> => {
  const user = loadStorageUser();
  const token = loadStorageAccessToken();
  const exp_date = loadStorageExpDate();
  const permissions = loadStoragePermissions();
  // const { user, token } = store.getState().auth;
  if (user && token) {
    store.dispatch((dispatch) => dispatch(setAuth(user, token, exp_date, permissions)));
  }
  // if (exp_date) store.dispatch((dispatch) => dispatch(setExpDate(exp_date)));
  
  // else {
  // const authResponse = await getRequest<{ user?: AuthUser, access_token?: string }>('auth/out-refresh', { withCredentials: true });
  // if (authResponse.access_token && authResponse.user) {
  //   saveAccessToken(authResponse.access_token);
  //   saveUser(authResponse.user);
  //   store.dispatch(setAuth(authResponse.user, authResponse.access_token));
  // }
  // else
  // console.log("CHECK_AUTH:: Not logged");
  // }
  store.dispatch((dispatch) => dispatch(setAppState("OK")));
}

// export const getUser = (): AuthUser | undefined => {
//   return store.getState().auth.user;
// }

function saveAccessToken(token: string) {
  localStorage.setItem(LOCAL_TOKEN_PREFIX, token);
}
function saveUser(user: AuthUser) {
  localStorage.setItem(LOCAL_USER_PREFIX, JSON.stringify(user));
}
function saveExpDate(exp_date: string) {
  localStorage.setItem(LOCAL_EXP_DATE_PREFIX, exp_date);
}
function savePermissions(permissions: RbacPermission[]) {
  localStorage.setItem(LOCAL_PERMISSIONS, JSON.stringify(permissions));
}
export function loadStorageAccessToken(): string | null {
  return localStorage.getItem(LOCAL_TOKEN_PREFIX);
}
export function loadStorageUser(): AuthUser | null {
  const userData = localStorage.getItem(LOCAL_USER_PREFIX);
  try {
    if (userData != null)
      return JSON.parse(userData);
  } catch (err) {
    console.error(err);
  }
  return null;
}

export function checkIfNumber(numString: string | null): number {
  if (!numString) return 0;
  if (numString != null && !isNaN(parseInt(numString))) {
    return parseInt(numString);
  } else return 0;
}

export function loadStorageExpDate(): number {
  return checkIfNumber(localStorage.getItem(LOCAL_EXP_DATE_PREFIX));
}

export function loadStoragePermissions(): RbacPermission[]  {
  let result = localStorage.getItem(LOCAL_PERMISSIONS);
  let permissions: RbacPermission[] = [];
  if (result != null) permissions = JSON.parse(result);
  return permissions;
}