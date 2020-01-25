import { RbacPermission } from "shared/store/auth/auth.types";

export interface User {
    name: string;
    username?: string;
    db: string;
    level: number;
    id: number;
    snif?: number;
    snif_arr?: number[];
    branches?: number[];
    tafkid: string;
    tel: string;
    role?: string;
}
export interface AuthUser {
    id: number;
    tel: string;
    name: string;
    username?: string;
    db: string;
    level: number;
    branches?: number[];
    tafkid: string;
    role?: string;
    permissions?: RbacPermission[];
    netw: string;
    appOnly:number;
}