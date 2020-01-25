export type NavBarSection = {
  title: string,
  navLink: string,
  mobile: boolean,
  disabled?: boolean,
  level: number,
  id: string,
  icon: string,
  children?: NavBarSection[] | null,
  action: string
}

export type Department = {
  Id: number,
  Name: string
}

export type Location = {
  Id: number,
  Name: string
}

export type Category = {
  Id: number,
  Name: string
}

export type CannabisItem = {
  Id: number,
  BarCode: number,
  Name: string,
  THC: number,
  CBD: number
}

export type Pharmacy = {
  Id: number,
  LocationId: number,
  Name: string,
  Address: string,
  Phone: string
}

export type Stock = {
  Id: number,
  PharmacyId: number, 
  LocationId: number, 
  CategoryId: number, 
  SupplierId: number, 
  InStock: number, 
  ByUser: number
}

export type Group = {
  Id: number,
  Name: string,
  ClassId: number
}

export type Subgroup = {
  Id: number,
  Name: string,
  GroupId: number
}

export type Degem = { // Series - degem table
  Id: number,
  Name: string
}

export type Sapak = { // Supplier - sapak table
  Id: number,
  Name: string
}

export type Supplier = { 
  Id: number,
  Name: string
}

export type BranchType = { // branches_type table
  Id: number,
  Name: string
}

export type Branch = { // branches table
  BranchId: number,
  Name: string,
  BranchType: number,
  Percent: number,
  Weeks: number,
  TotMax: number,
  TotWeight: number,
  NetworkId: number
}

export type MigvanBranch = { // migvan_branch table
  Id: number,
  BranchId: number,
  BarCode: number,
}

export type MigvanBranchName = { // based on migvan_branch table
  Id: number,
  BranchId: number,
  BranchName: number,
  BarCode: number,
  CatalogName: number,
}

export type MigvanSapak = { // migvan_sapak table
  Id: number,
  BarCode: number,
  SapakId: number,
  Code: number,
  Main: number
}

export type MigvanSapakName = { // based on migvan_sapak table
  Id: number,
  BarCode: number,
  CatalogName: number,
  SapakId: number,
  SapakName: number,
  Code: number,
  Main: number
}

export type UnitSize = { //  unitSize table in DB Admin
  Id: number,
  Name: string
}

export type SingleSupplierItem = {
  BarCode: number,
  SupplierId: number
}

export type CatalogItem = { // catalog table
  Id: number,
  CatalogId: number,
  Name: string,
  BarCode: number,
  ClassesId: number,
  GroupId: number,
  SubGroupId: number,
  SapakId: number,
  DegemId: number,
  Shakele: boolean,
  Ariza: number,
  Archives: number,
  Bdate_buy: string,
  Bdate_sale: string,
  UnitAriza: string,
  SizeAriza: boolean,
  statusCalMlay: boolean,
  managed: boolean,
  NoMlay: boolean,
  length: number,
  lengthSize: number,
  width: number,
  widthSize: number,
  height: number,
  heighthSize: number,
  scope: number,
  scopeSize: number,
  weightGross: number,
  weightGrossSize: number,
  weightNeto: number,
  weightNetoSize: number,
  techula: number,
  techulaSize: number,
  ArchivesUser: number,
  flagLeaven: boolean,
  Adegem: number,
  Create_Date: Date | null,
  Toarc_Date: Date | null,
  BL_datebuy: Date | null,
  Pesach: boolean | null,
  p_loss: boolean,
}

export type Peruk = {
  Id: number,
  BarCodeParent: number,
  BarCodeChild: number,
  Remark: string,
  Level: string,
  Percent: number,
  Key: string
}

export type PerukName = {
  Id: number,
  BarCodeParent: number,
  ParentName: number,
  BarCodeChild: number,
  ChildName: number,
  Remark: string,
  Level: string,
  Percent: number,
  Key: string
}

export type PerukWithName = {
  Id: number,
  BarCodeParent: number,
  ParentName: string,
  ParentAmount: number,
  BarCodeChild: number,
  ChildName: string,
  ChildAmount: number,
  Remark: string,
  Level: string,
  Percent: number,
  Key: string
}

export type Subbar = { // table sub_bar or sub_bar_general, תחליפים כללי, תחליפים
  Id: number,
  Name: string,
  br1: number,
  br2: number,
  br3: number,
  br4: number,
  br5: number,
  br6: number,
  br7: number,
  br8: number,
  br9: number,
  br10: number
}

export type AspakaRecord = {
  Id: number,
  SapakId: number,
  BranchId: number,
  AspakaDay: number,
  OrderDay: number,
  Wensell: number,
  days_order: number
}

export type AspakaUnique = {
  Id: number,
  SapakId: number,
  BranchId: number,
  OrderDay_1: number | null,
  AspakaDay_1: number | null,
  OrderDay_2: number | null,
  AspakaDay_2: number | null,
  OrderDay_3: number | null,
  AspakaDay_3: number | null,
  OrderDay_4: number | null,
  AspakaDay_4: number | null,
  OrderDay_5: number | null,
  AspakaDay_5: number | null,
  OrderDay_6: number | null,
  AspakaDay_6: number | null,
  Wensell: number,
  Key: string
}

export type AspakaDetail = {
  Id: number,
  SapakId: number,
  BranchId: number,
  AspakaDay: number,
  OrderDay: number,
  Wensell: number,
  days_order: number,
  Key: string
}

export type Supsiryun = {
  Id: number,
  SapakId: number,
  GroupId: number,
  ScrId: number,
  Place: number
}

export type SupsiryunName = {
  Id: number,
  SapakId: number,
  SapakName: number,
  GroupId: number,
  GroupName: number,
  ScrId: number,
  Place: number
}

export type Siryun = {
  Id: number,
  CreateDate: Date,
  BarCode: number,
  ClassId: number,
  GroupId: number,
  SapakId: number,
  SapakSiryun: number | null,
  CreatedBy: number
}

export type ReservedOrder = {
  Id: number,
  DeliveryDate: Date,
  OrderDate: Date,
  BarCode: number,
  NetworkId: number,
  BranchId: number,
  ClassId: number,
  GroupId: number,
  SupplierId: number,
  OrderNum: number,
  AmountOrdered: number,
  AmountApproved: number,
  AmountDiff: number,
  CreatedBy: number,
  IsOrderSent: number,
  RecordType: string
}

export type Scrmenu = {
  Id: number,
  Name: string
}

export type Dorder = {
  Id: number,
  BranchId: number,
  BarCode: number,
  d1: number | null,
  d2: number | null,
  d3: number | null,
  d4: number | null,
  d5: number | null,
  d6: number | null,
  d7: number | null
}

export type DorderName = {
  Id: number,
  BranchId: number,
  BranchName: number,
  BarCode: number,
  BarCodeName: number,
  d1: number | null,
  d2: number | null,
  d3: number | null,
  d4: number | null,
  d5: number | null,
  d6: number | null,
  d7: number | null
}

export type Siba = {
  Id: number,
  Siba: number,
  Description: string
}

export type SibaRes = {
  Id: number,
  Name: string
}

export type CodeConversion = {
  Code: number,
  Branch: number,
  BranchName: number
  Sapak: number
  SapakName: number
}

export type InternalOrder = {
  BranchId: number,
  OrderNum: number,
  OrderDate: Date,
  BarCode: number,
  GroupId: number,
  SupplierId: number,
  AmountOrdered: number,
  DeliveryDate: Date,
  CreatedBy: number
}

export type Order = {
  OrderNum: number,
  NetworkId: number,
  BarCode: number,
  GroupId: number,
  SapakId: number,
  AmountOrder: number,
  BranchId: number,
  CreatedBy: number,
  AspakaDate: Date,
  OrderDate: Date, // created date
  //AmountReceive:number
}

export type OrderWithId = {
  Id: number,
  OrderNum: number,
  NetworkId: number,
  BarCode: number,
  GroupId: number,
  SapakId: number,
  AmountOrder: number,
  BranchId: number,
  CreatedBy: number,
  AspakaDate: Date,
  OrderDate: Date, // created date
  //AmountReceive:number
}

export type OrderWithName = {
  OrderNum: number,
  Lines: number,
  BarCode: number,
  BarCodeName: number,
  SapakId: number,
  UnitAriza: number,
  AmountOrder: number,
  BranchId: number,
  BranchName: number,
  OrderDate: Date, // created date
  CreatedBy: number, // created by
  AspakaDate: Date,
  key: string
}

export type OrderWithNameUnique = {
  OrderNum: number,
  SapakId: number,
  Lines: number,
  BranchId: number,
  BranchName: number,
  OrderDate: Date, // created date
  CreatedBy: number, // created by
  AspakaDate: Date,
  key: string
}

export type User = {
  id: number,
  name: string
}

export type BranchNetwork = {
  Id: number,
  Name: string
}

export type InitialOrderInventory = {
  BarCode: number,
  BarCodeName: string,
  UnitId: number,
  UnitName: string,
  DepartmentId: number,
  DepartmentName: string,
  GroupId: number,
  GroupName: string,
  OrderedAmount: number | undefined
}

export type InitialItemsToTransfer = {
  BarCode: number,
  BarCodeName: string,
  UnitId: number,
  UnitName: string,
  DepartmentId: number,
  DepartmentName: string,
  GroupId: number,
  GroupName: string,
  Counted: number | undefined
}

export type InitialItemInventory = {
  BarCode: number,
  BarCodeName: string,
  UnitId: number,
  UnitName: string,
  DepartmentId: number,
  DepartmentName: string,
  GroupId: number,
  GroupName: string,
  Counted: number | undefined
}

export type InitialItemsToDestroy = {
  BarCode: number,
  BarCodeName: string,
  UnitId: number,
  UnitName: string,
  DepartmentId: number,
  DepartmentName: string,
  GroupId: number,
  GroupName: string,
  Counted: number | undefined
}

export type InitialItemsToConvert = {
  BarCode: number,
  BarCodeName: string,
  UnitId: number,
  UnitName: string,
  DepartmentId: number,
  DepartmentName: string,
  GroupId: number,
  GroupName: string,
  Counted: number | undefined
}

export type InternalOrderWithName = {
  BranchId: number,
  OrderNum: number,
  OrderDate: Date,
  BarCode: number,
  BarCodeName: string,
  GroupId: number,
  SupplierId: number,
  AmountOrdered: number,
  DeliveryDate: Date,
  CreatedBy: number
}

export type Status = {
  status: string,
  message: string
}

export type Destructions = {
  DestructionNumber: number,
  DestructionReason: number,
  DestructionAuth: number,
  BarCode: number,
  Amount: number,
  BranchId: number,
  NetworkId: number,
  CreatedDate: Date,
  CreatedBy: number,
  Comex: number,
  Status: string,
  Notes: string,
}

export type Yedm = {
  Name: string,
  snif_katan: string,
}

export type Yedmivs = {
  Name: string,
}

export type Yedtzs = {
  Name: string,
}

export type Yeds = {
  Name: string,
  Id: number,
  fdatec: Date | null,
  tdatec: Date | null,
  date_buy: Date | null,
  rem_lines: string,
  snif_katan: string,
}

export type YedionType = {
  Id: number,
  kyed: number,
  kyedm: number,
  kyedmiv: number,
  kyedtz: number,
  rem: string,
  barcode: string,
  degem: string,
  sapakid: number,
  miv_name: string,
  kamut: number,
  price: number,
  kamutbuy: number,
  kamutsale: number,
  barcodePrice: number,
  kamutmat: number,
  gondola:number
} 

export type CampaignType={
id:number,
begin_at: Date | null,
end_at: Date | null,
barcode:number,
singular_price:number,
price:number,
campaign_type:number
}