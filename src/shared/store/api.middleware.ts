import { Middleware } from "redux";
import { getRequest } from "../http";

export enum API_ACTIONS {
    API_CALL = "API_CALL",
    API_PENDING = "API_PENDING",
    API_SUCCESS = "API_SUCCESS",
    API_ERROR = "API_ERROR",
}

export type ApiActionType = {
    type: API_ACTIONS,
    payload: {
        action: () => void,
        method?: string,
        data?: any,
        params?: any,
        timeout?: number
    }
}

export const apiPending = (action: any) => ({
    type: API_ACTIONS.API_PENDING,
    payload: action
})
export const apiSuccess = (data: any) => ({
    type: API_ACTIONS.API_SUCCESS,
    payload: data
})
export const apiFailure = (error: any) => ({
    type: API_ACTIONS.API_ERROR,
    payload: error
})

export const apiMiddleware: Middleware = store => next => action => {
    if (action.type === API_ACTIONS.API_CALL) {
        const dispatch = store.dispatch;
        console.log("API_CALL");
        const { path, method, data, params, timeout } = action.payload;
        dispatch(apiPending(action));
        switch (method) {
            case "POST":
                break;
            default:
                getRequest<any>(path, {
                    method: "GET",
                    data,
                    params,
                    timeout
                }).then(data => {
                    dispatch(action.payload.action(action));
                })
                break;
        }
    }
    return next(action)
}