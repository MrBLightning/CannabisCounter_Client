import thunkMiddleware, { ThunkMiddleware } from 'redux-thunk'
import { createLogger } from 'redux-logger'
import { createStore, applyMiddleware, AnyAction } from 'redux'
import { rootReducer, AppState } from './store/app.reducer';
import { apiMiddleware } from './store/api.middleware';
import { localStorageMiddleware } from './store/localstorage.middleware';
import config from './config';

export const store = createStore(
    rootReducer,
    config.ENV !== "production" ? applyMiddleware(
        thunkMiddleware as ThunkMiddleware<AppState, AnyAction>,
        createLogger(),
        apiMiddleware,
        localStorageMiddleware
    ) : applyMiddleware(
        thunkMiddleware as ThunkMiddleware<AppState, AnyAction>,
        apiMiddleware,
        localStorageMiddleware
    )
);