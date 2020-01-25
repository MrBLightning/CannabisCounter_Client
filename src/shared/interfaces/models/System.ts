
// export namespace System {
export type Branch = {
    BranchId: number,
    Name: string,
    Latitude?: number,
    Longitude?: number
}
export type Supplier = {
    Id: number,
    Name: string
}
export type Class = {
    Id: number,
    Name: string
}
export type Serie = {
    Id: number,
    Name: string
}
export type Group = {
    Id: number,
    Name: string
}
export type SubGroup = {
    Id: number,
    Name: string,
    GroupId: number,
}
// }