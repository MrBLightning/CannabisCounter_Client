import React, { Component } from 'react'
import { connect } from 'react-redux'
import { DateBox, SelectBox, Button, TagBox, DataGrid } from 'devextreme-react'
import { Column, Texts, Sorting, Scrolling, HeaderFilter, FilterRow, Export } from 'devextreme-react/data-grid'
import DataSource from 'devextreme/data/data_source'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AnyAction, bindActionCreators } from 'redux'
import { ThunkDispatch } from 'redux-thunk'
import { Rnd } from 'react-rnd';

import { AppState } from 'shared/store/app.reducer'
import { fetchCatalogSales, CatalogSaleRecord } from 'shared/api/sales.provider';
import { SidebarProductDragable } from './SidebarProductDragable';
import { faFilter, faWindowClose } from '@fortawesome/free-solid-svg-icons';
import { uiNotify } from 'shared/components/Toast';
import EditableBarcodeStatus from './SaleReport/EditableBarcodeStatus'
import { fetchBarcodeStatuses } from 'shared/api/catalog.provider'
import { setBarcodeStatuses } from 'shared/store/catalog/catalog.action'
import { hideSalesReport } from 'shared/store/planogram/display/display.actions'

import XLSX from 'xlsx';

// const formatQuantity = "###,###";

type ReportSaleRecord = CatalogSaleRecord & { InStore: boolean,
                            /*Barak 13.1.20*/ Name: string
};

const mapStateToProps = (state: AppState, ownProps: any) => ({
    products: state.catalog.products,
    productsMap: state.catalog.productsMap,
    displayAisle: state.planogram.display.aisleIndex != null
        && state.planogram.store
        && state.planogram.store.aisles[state.planogram.display.aisleIndex] ? state.planogram.store.aisles[state.planogram.display.aisleIndex].aisle_id : null,
    displaySalesReport: state.planogram.display.displaySalesReport,
    virtualProductDetails: state.planogram.productDetails,
    planogram: state.planogram,
    suppliers: state.system.data.suppliers,
    classes: state.system.data.classes,
    groups: state.system.data.groups,
    subGroups: state.system.data.subGroups,
    branches: state.system.data.branches,
    series: state.system.data.series,
})

const mapDispatchToProps = (dispatch: ThunkDispatch<AppState, {}, AnyAction>) => ({

    fetchBarcodeStatuses: () => fetchBarcodeStatuses()
        .then(statuses => dispatch(setBarcodeStatuses(statuses)))
        .catch((err) => {
            uiNotify("Unable to load network barcode statuses")
        }),
    hideSalesReport: () => dispatch(hideSalesReport())
})


type PlanogramReportProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>
type PlanogramReportState = {
    loading: boolean,
    pageIndex: number,
    pageSize: number,
    salesRecords: ReportSaleRecord[],
    searchWord: string,
    report: {
        beginDate: Date,
        endDate: Date,
        sortBy: string | null,
        currentAisleOnly: boolean,
        sortMap: { [key: string]: boolean },
        selectedBarcodes?: number[],
        selectedBranches?: number[],
        selectedSuppliers?: number[],
        selectedGroups?: number[],
        selectedSubGroups?: number[],
        selectedClasses?: number[],
        selectedSeries?: number[],
    },
    height: number,
    width: number
};

// function filterRecords(property: "TotalAmount" | "TotalPrice", records: CatalogSaleRecord[], desc: boolean) {
//     if (desc)
//         return records.sort((a, b) => {
//             if (a[property] < b[property])
//                 return 1;
//             return -1;
//         })
//     else
//         return records.sort((a, b) => {
//             if (a[property] > b[property])
//                 return 1;
//             return -1;
//         })
// }
class PlanogramReport extends Component<PlanogramReportProps, PlanogramReportState> {
    state: PlanogramReportState = {
        loading: false,
        pageIndex: 0,
        pageSize: 50,
        searchWord: "",
        report: {
            currentAisleOnly: false,
            beginDate: new Date(new Date().getFullYear(), 0, 1),
            endDate: new Date(),
            sortBy: null,
            sortMap: {},
        },
        width: window.innerWidth * 0.5656,
        height: window.innerHeight * 0.5656,
        salesRecords: [],
    }
    componentDidMount() {
        this.props.fetchBarcodeStatuses();
    }
    onSearch = () => {
        const { beginDate, endDate, selectedBranches } = this.state.report;
        const { productsMap, virtualProductDetails, products } = this.props;
        if (productsMap == null || products.length === 0)
            return console.log("No products in search");

        this.setState({
            loading: true
        });
        fetchCatalogSales({
            beginDate,
            endDate,
            branch: selectedBranches,
            // supplier: selectedSuppliers,
            // group: selectedGroups,
            // class: selectedClasses,
        }).then((catalogSales) => {
            this.setState({
                loading: false,
                salesRecords: catalogSales.map(v => {

                    const newProduct: ReportSaleRecord = {
                        ...v,
                        InStore: virtualProductDetails[v.BarCode] != null,
                        /*Barak 13.1.20*/ Name: productsMap[v.BarCode] ? productsMap[v.BarCode].Name : ''
                    };

                    if (!productsMap[v.BarCode]) return newProduct;
                    const product = productsMap[v.BarCode];
                    return {
                        ...newProduct,
                        SupplierId: product.SapakId,
                        GroupId: product.GroupId,
                        SubGroupId:product.SubGroupId,
                        ClassId: product.ClassesId,
                    }
                })
            })
        }).catch((err) => {
            console.error(err);
            uiNotify("Unable to load sales", "error");
            this.setState({
                loading: false
            })
        })
    }

    setSortMapItem = (property: string) => () => {
        let newSortMap = { ...this.state.report.sortMap }
        if (newSortMap[property] === false)
            delete newSortMap[property];
        else if (newSortMap[property] === true)
            newSortMap[property] = false;
        else newSortMap = {
            [property]: true,
            ...newSortMap
        }
        this.setState({
            report: {
                ...this.state.report,
                sortMap: newSortMap
            }
        })
    }

    /* Barak 13.1.20 - callXlsOutput, xlsOutput */
    xlsOutput = (e: any) => {
        console.log('xlsOutput');
        // Export XLSX file with errors:
        // https://github.com/SheetJS/sheetjs/issues/817

        const { salesRecords } = this.state;
        const {
            beginDate,      // date effects this.state.salesRecords directly in function fetchCatalogSales
            endDate,        // date effects this.state.salesRecords directly in function fetchCatalogSales
            currentAisleOnly,
            selectedGroups,
            selectedSubGroups,
            selectedSeries,
            selectedSuppliers,
            selectedClasses
        } = this.state.report;
        const { productsMap, virtualProductDetails } = this.props;

        let filteredRecords = salesRecords;

        const url = window.location.href;
        const urlElements = url.split('/');
        const currentAisle = parseInt(urlElements[6]);

        if (currentAisleOnly && currentAisle != null) {
            filteredRecords = filteredRecords.filter(v =>
                virtualProductDetails[v.BarCode]
                && virtualProductDetails[v.BarCode].position
                && virtualProductDetails[v.BarCode].position.findIndex(p => p.aisle_id === currentAisle) !== -1);
        }

        if (selectedSuppliers != null && selectedSuppliers.length > 0)
            filteredRecords = filteredRecords.filter(v => v.SupplierId == null || selectedSuppliers.includes(v.SupplierId));
        if (selectedClasses != null && selectedClasses.length > 0)
            filteredRecords = filteredRecords.filter(v => v.ClassId == null || selectedClasses.includes(v.ClassId));
        if (selectedGroups != null && selectedGroups.length > 0)
            filteredRecords = filteredRecords.filter(v => productsMap[v.BarCode] && productsMap[v.BarCode].GroupId && selectedGroups.includes(productsMap[v.BarCode].GroupId || -1));
        if (selectedSubGroups != null && selectedSubGroups.length > 0)
            filteredRecords = filteredRecords.filter(v => productsMap[v.BarCode] && productsMap[v.BarCode].SubGroupId && selectedSubGroups.includes(productsMap[v.BarCode].SubGroupId || -1));
        if (selectedSeries != null && selectedSeries.length > 0)
            filteredRecords = filteredRecords.filter(v => productsMap[v.BarCode] && productsMap[v.BarCode].DegemId && selectedSeries.includes(productsMap[v.BarCode].DegemId || -1));

        // now that I have all the information I'm building a new JSON for the excel output
        let length = filteredRecords.length;
        let reportJSON = [];
        for (let i = 0; i < length; i++) {
            let branch = this.props.branches.filter(branch => branch.BranchId === filteredRecords[i].BranchId)[0];
            let supplier = this.props.suppliers.filter(supplier => supplier.Id === filteredRecords[i].SupplierId)[0];
            let department = this.props.classes.filter(department => department.Id === filteredRecords[i].ClassId)[0];
            let group = this.props.groups.filter(group => group.Id === filteredRecords[i].GroupId)[0];
            let subGroup = this.props.subGroups.filter(subGroup => subGroup.Id === filteredRecords[i].SubGroupId)[0];
            let planogramDetail = this.props.planogram.productDetails[filteredRecords[i].BarCode];
            let object = {
                Branch_Id: filteredRecords[i].BranchId,
                Branch_Name: branch ? branch.Name : null,
                Gondola: planogramDetail && planogramDetail.position ? planogramDetail.position.map(p => p.aisle_id).filter((p, i, list) => list.indexOf(p) === i).join() : null,
                Shelf_Content: planogramDetail ? planogramDetail.maxAmount : null,
                Item_BarCode: filteredRecords[i].BarCode,
                Item_Name: filteredRecords[i].Name,
                Supplier_Id: filteredRecords[i].SupplierId,
                Supplier_Name: supplier ? supplier.Name : null,
                Department_Id: filteredRecords[i].ClassId,
                Department_Name: department ? department.Name : null,
                Group_Id: filteredRecords[i].GroupId,
                Group_Name: group ? group.Name : null,
                SubGroup_Id: filteredRecords[i].SubGroupId,
                SubGroup_Name: subGroup ? subGroup.Name : null,
                TotalAmount: filteredRecords[i].TotalAmount,
                TotalPrice: filteredRecords[i].TotalPrice,
                InStore: filteredRecords[i].InStore
            }
            reportJSON.push(object);
        }

        let ws = XLSX.utils.json_to_sheet(reportJSON);
        let wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "דוח מכירות");
        //// for some unknown reason this entire function is happening more than once 
        //// due to writeFile + mapDispatchToProps (possibly)
        XLSX.writeFile(wb, "דוח_מכירות.xlsx");
    }



    render() {
        if (!this.props.displaySalesReport || this.props.products.length === 0)
            return null;
        const { salesRecords } = this.state;
        const { beginDate,
            endDate,
            currentAisleOnly,
            selectedBranches,
            selectedGroups,
            selectedSubGroups,
            selectedSeries,
            /*Barak 13.1.20 */ selectedSuppliers,
            /*Barak 13.1.20 */ selectedClasses,
        } = this.state.report;
        const { productsMap, virtualProductDetails, displayAisle } = this.props;
        let { branches, classes, groups, subGroups, suppliers, series, } = this.props;

        // const { pageIndex, pageSize } = this.state;

        let filteredRecords = salesRecords;

        /* Barak 13.1.20 - remove old displayAisle filter
        if (currentAisleOnly && displayAisle != null) {
            filteredRecords = filteredRecords.filter(v =>
                virtualProductDetails[v.BarCode]
                && virtualProductDetails[v.BarCode].position
                && virtualProductDetails[v.BarCode].position.findIndex(p => p.aisle_id === displayAisle) !== -1);
        }
        */

        /* Barak 13.1.20 - get asile from url*/
        const url = window.location.href;
        const urlElements = url.split('/');
        const currentAisle = parseInt(urlElements[6]);

        /* Barak 13.1.20 - create new currentAisleOnly filter using currentAisle instead of displayAisle*/
        if (currentAisleOnly && currentAisle != null) {
            filteredRecords = filteredRecords.filter(v =>
                virtualProductDetails[v.BarCode]
                && virtualProductDetails[v.BarCode].position
                && virtualProductDetails[v.BarCode].position.findIndex(p => p.aisle_id === currentAisle) !== -1);
        }

        // if (selectedBarcodes != null && selectedBarcodes.length > 0)
        //     filteredRecords = filteredRecords.filter(v => selectedBarcodes.includes(v.BarCode));
        // if (selectedBranches != null && selectedBranches.length > 0)
        //     filteredRecords = filteredRecords.filter(v => v.BranchId == null || selectedBranches.includes(v.BranchId));

        if (selectedSuppliers != null && selectedSuppliers.length > 0)
            filteredRecords = filteredRecords.filter(v => v.SupplierId == null || selectedSuppliers.includes(v.SupplierId));
        if (selectedClasses != null && selectedClasses.length > 0)
            filteredRecords = filteredRecords.filter(v => v.ClassId == null || selectedClasses.includes(v.ClassId));

        if (selectedGroups != null && selectedGroups.length > 0)
            filteredRecords = filteredRecords.filter(v => productsMap[v.BarCode] && productsMap[v.BarCode].GroupId && selectedGroups.includes(productsMap[v.BarCode].GroupId || -1));
        if (selectedSubGroups != null && selectedSubGroups.length > 0)
            filteredRecords = filteredRecords.filter(v => productsMap[v.BarCode] && productsMap[v.BarCode].SubGroupId && selectedSubGroups.includes(productsMap[v.BarCode].SubGroupId || -1));
        if (selectedSeries != null && selectedSeries.length > 0)
            filteredRecords = filteredRecords.filter(v => productsMap[v.BarCode] && productsMap[v.BarCode].DegemId && selectedSeries.includes(productsMap[v.BarCode].DegemId || -1));
        const salesToSupplier: number[] = []
        const salesToClass: number[] = []

        for (let i = 0; i < salesRecords.length; i++) {
            const record = salesRecords[i];
            if (record.SupplierId != null) {
                salesToSupplier.push(record.SupplierId);
            }
            if (record.ClassId != null) {
                salesToClass.push(record.ClassId);
            }
        }
        const filteredSuppliers = suppliers.filter(s => salesToSupplier.includes(s.Id))
        const filteredClasses = classes.filter(c => salesToClass.includes(c.Id))

        const { height: floatHeight, width: floatWidth } = this.state;

        return (
            <Rnd
                dragHandleClassName="planogram-report-handle"
                cancel="planogram-report-container"
                default={{
                    x: floatWidth / 2,
                    y: floatHeight / 2,
                    width: floatWidth,
                    height: floatHeight,
                }}
                className="float-window planogram-report"
                resizeHandleClasses={{
                    bottomRight: "planogram-report-resize-handle bottom-right",
                    // bottomLeft: "planogram-report-resize-handle bottom-left",
                }}>
                <div className="float-window-handle planogram-report-handle">
                    <div className="handle-content">Sale Report</div>
                    <div className="float-window-close" onClick={this.props.hideSalesReport}>
                        <FontAwesomeIcon icon={faWindowClose} />
                    </div>
                </div>
                <div className="float-window-container planogram-report-container">
                    {this.state.loading ?
                        <div className="loader"></div>
                        :
                        <React.Fragment>
                            <div className="report-toolbar">
                                <div className="report-toolbar-container">
                                    {/* Barak 13.1.20 - xlsOutput button */}
                                    <Button
                                        rtlEnabled
                                        onClick={(e) => {
                                            // console.log('click', e);
                                            this.xlsOutput(e);
                                        }}
                                        className="toolbar-item-small"
                                        icon="exportxlsx" />
                                    <DateBox
                                        rtlEnabled
                                        className="toolbar-item"
                                        placeholder="תאריך תחילה"
                                        value={beginDate}
                                        displayFormat="dd/MM/yy"
                                        pickerType={"calendar"}
                                        onValueChanged={(e) => {
                                            // console.log(e.value);
                                            this.setState({
                                                report: {
                                                    ...this.state.report,
                                                    beginDate: e.value
                                                }
                                            })
                                        }} />
                                    <DateBox
                                        rtlEnabled
                                        className="toolbar-item"
                                        placeholder="תאריך סיום"
                                        value={endDate}
                                        displayFormat="dd/MM/yy"
                                        pickerType={"calendar"}
                                        onValueChanged={(e) => {
                                            // console.log(e.value);
                                            this.setState({
                                                report: {
                                                    ...this.state.report,
                                                    endDate: e.value
                                                }
                                            })
                                        }} />
                                    <TagBox
                                        rtlEnabled
                                        searchEnabled
                                        showClearButton
                                        className="toolbar-item"
                                        placeholder="סדרה"
                                        value={selectedSeries}
                                        valueExpr="Id"
                                        displayExpr="Name"
                                        searchExpr={["Name", "Id"]}
                                        dataSource={new DataSource({
                                            store: series,
                                            pageSize: 50
                                        })}
                                        onValueChanged={(e) => {
                                            // console.log(e.value);
                                            this.setState({
                                                report: {
                                                    ...this.state.report,
                                                    selectedSeries: e.value
                                                }
                                            })
                                        }} />
                                    <SelectBox
                                        rtlEnabled
                                        showClearButton
                                        className="toolbar-item"
                                        placeholder="סניף"
                                        value={selectedBranches}
                                        valueExpr="BranchId"
                                        displayExpr="Name"
                                        items={branches}
                                        onValueChanged={(e) => {
                                            // console.log(e.value);
                                            this.setState({
                                                report: {
                                                    ...this.state.report,
                                                    selectedBranches: e.value
                                                }
                                            })
                                        }} />
                                    <Button
                                        rtlEnabled
                                        // disabled={selectedBranches == null || selectedBranches.length === 0}
                                        onClick={this.onSearch}
                                        className="toolbar-item"
                                        icon="search"
                                        text="חפש" />
                                </div>
                                <div className="report-toolbar-container">
                                    {/* <TagBox
                                    rtlEnabled
                                    showClearButton
                                    className="toolbar-item"
                                    valueExpr="BarCode"
                                    displayExpr={(item) => {
                                        if (item)
                                            return item.BarCode + " - " + item.Name
                                    }}
                                    placeholder="ברקוד"
                                    searchEnabled
                                    dataSource={new DataSource({
                                        store: this.props.products,
                                        pageSize: 10,
                                        searchExpr: ["BarCode", "Name"],
                                        searchOperation: "contains",
                                        sort: "BarCode"
                                    })}
                                    onValueChanged={(e) => {
                                        this.setState({
                                            report: {
                                                ...this.state.report,
                                                selectedBarcodes: e.value
                                            }
                                        })
                                    }}
                                /> */}
                                    <TagBox
                                        rtlEnabled
                                        searchEnabled
                                        showClearButton
                                        className="toolbar-item"
                                        placeholder="תת קבוצה"
                                        value={selectedSubGroups}
                                        valueExpr="Id"
                                        displayExpr="Name"
                                        searchExpr={["Name", "Id"]}
                                        dataSource={new DataSource({
                                            store: subGroups,
                                            pageSize: 50
                                        })}
                                        onValueChanged={(e) => {
                                            // console.log(e.value);
                                            this.setState({
                                                report: {
                                                    ...this.state.report,
                                                    selectedSubGroups: e.value
                                                }
                                            })
                                        }} />
                                    <TagBox
                                        rtlEnabled
                                        searchEnabled
                                        showClearButton
                                        className="toolbar-item"
                                        placeholder="קבוצה"
                                        value={selectedGroups}
                                        valueExpr="Id"
                                        displayExpr="Name"
                                        searchExpr={["Name", "Id"]}
                                        dataSource={new DataSource({
                                            store: groups,
                                            pageSize: 50
                                        })}
                                        onValueChanged={(e) => {
                                            // console.log(e.value);
                                            this.setState({
                                                report: {
                                                    ...this.state.report,
                                                    selectedGroups: e.value
                                                }
                                            })
                                        }} />
                                    {/* Barak 13.1.20 - un-comment selectedSuppliers, selectedClasses */}
                                    <TagBox
                                        rtlEnabled
                                        searchEnabled
                                        showClearButton
                                        className="toolbar-item"
                                        placeholder="מחלקה"
                                        value={selectedClasses}
                                        valueExpr="Id"
                                        displayExpr="Name"
                                        searchExpr={["Name", "Id"]}
                                        dataSource={new DataSource({
                                            store: classes,
                                            pageSize: 50
                                        })}
                                        onValueChanged={(e) => {
                                            // console.log(e.value);
                                            this.setState({
                                                report: {
                                                    ...this.state.report,
                                                    selectedClasses: e.value
                                                }
                                            })
                                        }} />
                                    <TagBox
                                        rtlEnabled
                                        searchEnabled
                                        showClearButton
                                        className="toolbar-item"
                                        placeholder="ספק"
                                        value={selectedSuppliers}
                                        valueExpr="Id"
                                        displayExpr="Name"
                                        searchExpr={["Name", "Id"]}
                                        dataSource={new DataSource({
                                            store: suppliers,
                                            pageSize: 50
                                        })}
                                        onValueChanged={(e) => {
                                            // console.log(e.value);
                                            this.setState({
                                                report: {
                                                    ...this.state.report,
                                                    selectedSuppliers: e.value
                                                }
                                            })
                                        }} />
                                    {/* <TagBox
                                        rtlEnabled
                                        searchEnabled
                                        showClearButton
                                        className="toolbar-item"
                                        placeholder="סדרה"
                                        value={selectedSeries}
                                        valueExpr="Id"
                                        displayExpr="Name"
                                        searchExpr={["Name", "Id"]}
                                        dataSource={new DataSource({
                                            store: series,
                                            pageSize: 50
                                        })}
                                        onValueChanged={(e) => {
                                            // console.log(e.value);
                                            this.setState({
                                                report: {
                                                    ...this.state.report,
                                                    selectedSeries: e.value
                                                }
                                            })
                                        }} /> */}
                                    {/* <Button
                                    rtlEnabled
                                    // onClick={this.onSearch}
                                    className="toolbar-item"
                                    icon="sort"
                                    text="סנן" /> */}
                                    <Button
                                        rtlEnabled
                                        className="toolbar-item"
                                        disabled={displayAisle == null}
                                        onClick={(e) => {
                                            this.setState({
                                                report: {
                                                    ...this.state.report,
                                                    currentAisleOnly: currentAisleOnly ? false : true
                                                }
                                            })
                                        }}>
                                        <FontAwesomeIcon icon={faFilter} style={{ display: currentAisleOnly ? "" : "none" }} />
                                        <span>גונדולה נוכחית</span>
                                    </Button>
                                </div>
                            </div>
                            <div className="report-content">
                                <DataGrid
                                    rtlEnabled
                                    showRowLines
                                    showColumnHeaders
                                    allowColumnResizing
                                    allowColumnReordering
                                    className="report-group-table"
                                    noDataText="אין נתונים..."
                                    dataSource={new DataSource({
                                        store: filteredRecords,
                                    })}>
                                    <Texts
                                    />
                                    <FilterRow visible />
                                    <HeaderFilter visible />
                                    <Sorting mode="multiple" />
                                    {/* <Sorting /> */}
                                    <Scrolling mode={'virtual'} />
                                    <Column
                                        dataField="InStore"
                                        dataType="boolean"
                                        caption="מיקום"
                                        defaultSortOrder="desc"
                                        cellRender={({ data }) => {
                                            return <ReportPositionCell record={data} />;
                                        }} />
                                    <Column
                                        dataField="BarCode"
                                        dataType="string"
                                        caption="מוצר"
                                        calculateCellValue={(data: CatalogSaleRecord) => productsMap[data.BarCode] ? productsMap[data.BarCode].BarCode + " " + productsMap[data.BarCode].Name : data.BarCode}
                                        cellRender={({ data }) => <ReportTitleCell record={data} />}>
                                        <HeaderFilter
                                            allowSearch
                                            searchMode="Contains"
                                        // searchTimeout={1000}
                                        />
                                    </Column>
                                    <Column
                                        dataField="SupplierId"
                                        caption="ספק"
                                        lookup={{
                                            dataSource: filteredSuppliers,
                                            displayExpr: "Name",
                                            valueExpr: "Id",
                                            allowClearing: true
                                        }}>
                                        <HeaderFilter allowSearch />
                                    </Column>
                                    <Column
                                        allowSearch
                                        dataField="ClassId"
                                        caption="מחלקה"
                                        lookup={{
                                            dataSource: filteredClasses,
                                            displayExpr: "Name",
                                            valueExpr: "Id",
                                            allowClearing: true
                                        }}>
                                        <HeaderFilter allowSearch />
                                    </Column>
                                    <Column
                                        allowSearch
                                        dataField="GroupId"
                                        caption="קבוצה"
                                        lookup={{
                                            dataSource: groups,
                                            displayExpr: "Name",
                                            valueExpr: "Id",
                                            allowClearing: true
                                        }}>
                                        <HeaderFilter allowSearch />
                                    </Column>
                                    <Column
                                        allowSearch
                                        dataField="SubGroupId"
                                        caption="תת קבוצה"
                                        lookup={{
                                            dataSource: subGroups,
                                            displayExpr: "Name",
                                            valueExpr: "Id",
                                            allowClearing: true
                                        }}>
                                        <HeaderFilter allowSearch />
                                    </Column>
                                    <Column
                                        allowSearch
                                        dataField="TotalPrice"
                                        caption="מכירות כספיות"
                                        defaultSortOrder="desc"
                                        format="###,###">
                                        <HeaderFilter allowSearch />
                                    </Column>
                                    <Column
                                        allowSearch
                                        dataField="TotalAmount"
                                        caption="מכירות כמותיות"
                                        defaultSortOrder="desc"
                                        format="###,###">
                                        <HeaderFilter allowSearch />
                                    </Column>
                                    <Column
                                        caption="תמונה"
                                        cellRender={({ data }) => <SidebarProductDragable
                                            product={data.BarCode}
                                            className="item-image"
                                        />} />
                                    <Column
                                        caption="הערה"
                                        cellRender={({ data }) => <EditableBarcodeStatus
                                            barcode={data.BarCode}
                                        />} />
                                </DataGrid>
                            </div>
                        </React.Fragment>
                    }
                </div>
            </Rnd>
        )
    }
}

const reportPositionCellStateToProps = (state: AppState, ownProps: { record: CatalogSaleRecord }) => {
    const product = state.catalog.productsMap[ownProps.record.BarCode];

    return {
        ...ownProps,
        supplier: product && product.SapakId ? state.system.data.suppliersMap[product.SapakId] : undefined,
        class: product && product.ClassesId ? state.system.data.classesMap[product.ClassesId] : undefined,
        product: product,
        planogramDetail: state.planogram.productDetails[ownProps.record.BarCode],
        isOver: state.planogram.display.productDetailer === ownProps.record.BarCode
    }
};
const reportTitleCellStateToProps = (state: AppState, ownProps: { record: CatalogSaleRecord }) => {
    return {
        ...ownProps,
        product: state.catalog.productsMap[ownProps.record.BarCode],
    }
};

class ReportPositionCellContainer extends Component<ReturnType<typeof reportPositionCellStateToProps>> {
    render() {
        const { product, planogramDetail, isOver } = this.props;

        if (product == null || !planogramDetail || planogramDetail.position.length === 0)
            return null;
        return (<div className="detail-section" style={{ background: isOver ? "#dbffdc" : "none" }}>
            <div className="detail-row">
                <label>{planogramDetail.position.length > 1 ? "גונדולות" : "גונדולה"}</label>
                <span>{planogramDetail.position.map(p => p.aisle_id).filter((p, i, list) => list.indexOf(p) === i).join()}</span>
            </div>
            <div className="detail-row">
                <label>תכולת מדף</label>
                <span>{planogramDetail.maxAmount}</span>
            </div>
        </div>);
    }
}
class ReportTitleCellContainer extends Component<ReturnType<typeof reportTitleCellStateToProps>> {
    render() {
        const { product, record } = this.props;
        return <div>
            <div className="item-title">{product ? product.Name : record.BarCode}</div>
            {product ? <div className="item-subtitle">{record.BarCode}</div> : null}
        </div>
    }
}

const ReportPositionCell = connect(reportPositionCellStateToProps)(ReportPositionCellContainer)
const ReportTitleCell = connect(reportTitleCellStateToProps)(ReportTitleCellContainer)

export default connect(mapStateToProps, mapDispatchToProps)(PlanogramReport)