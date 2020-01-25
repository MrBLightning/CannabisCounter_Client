import { AUTH_ACTION, AuthState, AuthActions } from "./auth.types"
import { AuthUser } from "shared/interfaces/models/User"
import { loadStorageAccessToken, loadStorageUser } from "shared/auth/auth.service";

export const initialUser: AuthUser = {
    id: 47,
    name: "Admin",
    level: 0,
    tafkid: "Admin",
    tel: "0551234123",
    db: "nyocha",
    branches: [24],
    netw: "nyocha",
    appOnly: 0
}

// const user = loadStorageUser();
// const accessToken = loadStorageAccessToken();

export const initialAuthState: AuthState = {}
// if (user && accessToken) {
//     initialState.user = user;
//     initialState.token = accessToken;
// }

export function authReducer(state = initialAuthState, action: AuthActions): AuthState {
    switch (action.type) {
        case AUTH_ACTION.SET_AUTH:
            return {
                ...state,
                user: action.user,
                token: action.token,
                exp_date: action.exp_date,
                permissions: action.permissions
            }
        case AUTH_ACTION.SET_TOKEN:
            return {
                ...state,
                token: action.token
            }
        case AUTH_ACTION.SET_USER:
            return {
                ...state,
                user: action.user
            }
        case AUTH_ACTION.SET_EXP_DATE:
            return {
                ...state,
                exp_date: action.exp_date
            }
        case AUTH_ACTION.SET_PERMISSIONS:
            return {
                ...state,
                permissions: action.permissions
            }
        case AUTH_ACTION.REMOVE_AUTH:
        case AUTH_ACTION.LOGOUT:
            return {}
        default:
            return state
    }
}
