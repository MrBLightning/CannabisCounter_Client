import { User, AuthUser } from "../models/User";

export default interface LoginResponse{
    user: AuthUser,
    access_token: string,
    exp_date: number
}