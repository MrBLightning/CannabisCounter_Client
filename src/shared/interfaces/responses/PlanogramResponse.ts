import { PlanogramStore } from "shared/store/planogram/planogram.types";

export interface PlanogramMainStructureResponse {
    aisles: any
}

export interface FetchPlanogramStoreResponse {
    status: "ok" | "empty",
    store: PlanogramStore | null
}