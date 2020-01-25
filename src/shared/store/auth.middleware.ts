import { Middleware } from "redux";

const AuthMiddleware: Middleware = store => next => action => {
    if (action.type === 'LOGIN_SUCCESS') {
        // after a successful login, update the token in the API
        // api.setToken(action.payload.authToken);
    }

    // continue processing this action
    return next(action);
}
export default AuthMiddleware;