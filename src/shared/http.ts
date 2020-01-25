import axios, {
    AxiosRequestConfig, AxiosInstance, AxiosResponse
} from "axios";
import config from "./config";
import { store } from "./store";
import { logout } from "./auth/auth.service";
import { setAppState } from "./store/system/system.actions";
import { bool } from "prop-types";

export const httpClient: AxiosInstance = axios.create({
    baseURL: config.API_URL,
    timeout: 30000,
    headers: {}
});
export const httpClientEmpty: AxiosInstance = axios.create({
    timeout: 30000,
    headers: {}
});

httpClient.defaults.withCredentials = true;
httpClient.interceptors.request.use((req: AxiosRequestConfig) => {
    const token = store.getState().auth.token;
    if (token != null)
        req.headers["Authorization"] = "Bearer " + token;
    return req;
});
httpClient.interceptors.response.use(resp => resp, error => {
    if (error && error.message === "Network Error")
        store.dispatch(setAppState("NO_NETWORK"));
    else if (error && error.response && error.response.status === 401)
        logout(); 
        //console.log('httpClient.interceptors.response error',error.response);
    return Promise.reject(error);
});

function checkResponse(r: AxiosResponse) {
    if (r && r.status >= 200 && r.status < 300) return;
    throw new Error("HttpClient:ERROR - " + r.status + ":" + r.statusText);;
}

export async function postRequest<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await httpClient.post<T, AxiosResponse<T>>(url, data, config);
    checkResponse(response);
    return response.data;
}
export async function putRequest<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await httpClient.put<T, AxiosResponse<T>>(url, data, config);
    checkResponse(response);
    return response.data;
}
export async function deleteRequest<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await httpClient.delete(url, config);
    checkResponse(response);
    return response.data;
}
export async function getRequest<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    let response = await httpClient.get(url, config);
    checkResponse(response);
    return response.data;
}

export class HttpClientError extends Error { }