import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { DataGrid } from 'devextreme-react';
import DataSource from 'devextreme/data/data_source';
import { FilterRow, HeaderFilter, LoadPanel, Paging, Editing, Popup, Form, Column, RequiredRule as devRequired, Scrolling, Export, MasterDetail, Texts } from 'devextreme-react/data-grid';
import { Popup as OutsidePopup } from 'devextreme-react/popup';
import { SelectBox } from 'devextreme-react';
import { TextBox } from 'devextreme-react/text-box';
import { Button } from 'devextreme-react/button';
import {
    Validator,
    RequiredRule,
} from 'devextreme-react/validator';
import { Item } from 'devextreme-react/form';
import { CatalogItem, Department, Order, User, UnitSize, OrderWithName, Branch, OrderWithNameUnique, Sapak } from 'shared/interfaces/models/SystemModels';
import { getUsers, getOrders, getCatalogItems, getUnitSizes, updateOrderData, deleteOrder, getBranches, getDepartments } from 'shared/api/order.provider';
import { uiNotify } from 'shared/components/Toast';
import XLSX from 'xlsx';
import { checkPageVersion } from 'shared/components/Version-control';
import { setVersionButton } from '../ManagePage';
import { checkPageToeknTime } from 'shared/components/Token-time-control';
import { RbacPermission } from 'shared/store/auth/auth.types';
import { confirm } from 'devextreme/ui/dialog';
// import OrderItemsDetailTemplate from './OrderItemsDetail';
import DevExpress from 'devextreme/bundles/dx.all';
import ReactToPrint from 'react-to-print';
import { checkIfNumber } from 'shared/auth/auth.service';
import { getSapaks } from 'shared/api/catalogItem.provider';
import Moment from 'moment';

const LOCAL_ORDERNUM = "local_OrderNumData";

type OrderItemsProps = {
    permission: RbacPermission;
} & RouteComponentProps;

type OrderItemsState = {
    orders: Order[],
    orderNames: OrderWithName[],
    orderNamesUnique: OrderWithNameUnique[],
    users: User[],
    branches: Branch[],
    suppliers: Sapak[],
    departments: Department[],
    catalogs: CatalogItem[],
    unitSize: UnitSize[],
    isPopupVisible: boolean,
    loading: boolean,
    userMessage: string,
    fromDate: Date | null,
    toDate: Date | null,
    selectBranch: number,
    selectDepartment: number,
    searchDate: Date,
    printOrderNum: number

}
export class OrderItems extends Component<OrderItemsProps> {
    dataGrid: any | null = null;
    reportRef: any | null = null;
    state: OrderItemsState = {
        orders: [],
        orderNames: [],
        orderNamesUnique: [],
        users: [],
        branches: [],
        suppliers: [],
        departments: [],
        catalogs: [],
        unitSize: [],
        isPopupVisible: false,
        loading: true,
        userMessage: '',
        fromDate: null,
        toDate: null,
        selectBranch: 0,
        selectDepartment: 0,
        searchDate: new Date(),
        printOrderNum: 0
    }

    loadAllCatalogItems = async (): Promise<void> => {
        try {
            const catalogs = await getCatalogItems();
            this.setState({ catalogs });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllSuppliers = async (): Promise<void> => {
        try {
            const suppliers = await getSapaks();
            this.setState({ suppliers });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllBranches = async (): Promise<void> => {
        try {
            const branches = await getBranches();
            this.setState({ branches });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllDepartments = async (): Promise<void> => {
        try {
            const departments = await getDepartments();
            this.setState({ departments });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }


    loadAllUnitSizes = async (): Promise<void> => {
        try {
            const unitSizes = await getUnitSizes();
            this.setState({ unitSizes });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllUsers = async (): Promise<void> => {
        try {
            const users = await getUsers();
            this.setState({ users });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    reloadAllOrders = async (): Promise<void> => {
        try {
            let orders = await getOrders();
            orders = orders.filter(order => order.OrderNum > 0
                // && order.OrderDate === this.state.searchDate
            );
            if (this.state.fromDate != null) {
                let fromDate = this.state.fromDate;
                orders = orders.filter(order => new Date(order.OrderDate).getTime() >= fromDate.getTime());
            }
            if (this.state.toDate != null) {
                let toDate = this.state.toDate;
                orders = orders.filter(order => new Date(order.OrderDate).getTime() <= toDate.getTime());
            }
            if (this.state.selectBranch > 0) {
                console.log(this.state.selectBranch);
                orders = orders.filter(order => order.BranchId == this.state.selectBranch);
            }
            this.setState({ orders });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
        let orderNames: OrderWithName[] = [];
        const orderNamesUnique: OrderWithNameUnique[] = [];
        const map = new Map();
        this.setState({ orderNames: [] });
        let length = this.state.orders.length;
        let item: CatalogItem;
        for (let i = 0; i < length; i++) {
            item = this.state.catalogs.filter(item => item.BarCode === this.state.orders[i].BarCode)[0];
            if (this.state.selectDepartment > 0 && item.ClassesId != this.state.selectDepartment) {
                return;
            }
            let orderName: OrderWithName = {
                OrderNum: this.state.orders[i].OrderNum,
                Lines: this.state.orders.filter(order => order.OrderNum == this.state.orders[i].OrderNum).length,
                BarCode: this.state.orders[i].BarCode,
                BarCodeName: this.state.orders[i].BarCode,
                SapakId: this.state.orders[i].SapakId,
                UnitAriza: parseInt(item.UnitAriza),
                AmountOrder: this.state.orders[i].AmountOrder,
                BranchId: this.state.orders[i].BranchId,
                BranchName: this.state.orders[i].BranchId,
                OrderDate: this.state.orders[i].OrderDate, // created date
                CreatedBy: this.state.orders[i].CreatedBy, // created by
                AspakaDate: this.state.orders[i].AspakaDate,
                key: this.state.orders[i].OrderNum + ''
            };
            orderNames.push(orderName);
        }
        for (let i = 0; i < length; i++) {
            if (!map.has(this.state.orders[i].OrderNum)) {
                map.set(this.state.orders[i].OrderNum, true);    // set a unique value to Map
                orderNamesUnique.push({
                    OrderNum: this.state.orders[i].OrderNum,
                    SapakId: this.state.orders[i].SapakId,
                    Lines: this.state.orders.filter(order => order.OrderNum == this.state.orders[i].OrderNum).length,
                    BranchId: this.state.orders[i].BranchId,
                    BranchName: this.state.orders[i].BranchId,
                    OrderDate: this.state.orders[i].OrderDate, // created date
                    CreatedBy: this.state.orders[i].CreatedBy, // created by
                    AspakaDate: this.state.orders[i].AspakaDate,
                    key: this.state.orders[i].OrderNum + ''
                });
            }
        }
        this.setState({ orderNames, orderNamesUnique });
        console.log(orderNamesUnique);
    }

    updateOrder = async (OrderNum: number, AspakaDate: Date): Promise<void> => {
        await updateOrderData(OrderNum, AspakaDate);
    }

    deleteOrder = async (OrderNum: number): Promise<void> => {
        await deleteOrder(OrderNum);
    }

    init = async () => {
        await this.loadAllCatalogItems();
        await this.loadAllSuppliers();
        await this.loadAllBranches();
        await this.loadAllDepartments();
        await this.loadAllUsers();
        await this.loadAllUnitSizes();
        await this.reloadAllOrders();
    }

    componentDidMount() {
        // check page version
        checkPageVersion();
        // check token expDate
        checkPageToeknTime();

        this.setState({ loading: true })
        this.init().then(() => {
            this.setState({ loading: false })
        }).catch(err => {
            uiNotify(err, 'error');
        })

        localStorage.removeItem(LOCAL_ORDERNUM);
    }

    // part of the DataGrid life-cycle. Happens everytime a line is updated in the page table
    onRowUpdated = async (e: any) => {
        console.log("update multi line with new date");
    }

    onEditorPreparing = (event: any) => {
        // https://www.devexpress.com/Support/Center/Question/Details/T749901/datagrid-allow-column-editing-on-insert-but-not-on-update
        let inserting = false;
        let updating = false;
        if ((typeof (event.row) != 'undefined') && (typeof (event.row.data.OrderNum) != 'undefined')) {
            updating = true;
        } else {
            inserting = true;
        }

        const notEditableOnUpdate: any = ['OrderNum', 'Lines', 'BranchId', 'BranchName', 'ts', 'RemarkId']; // data field names of columns not editable on update  
        const notEditableOnInsert: any = []; // data field names of columns not editable on insert  

        if (inserting && notEditableOnInsert.includes(event.dataField)) {
            event.editorOptions.disabled = true;
        } else if (updating && notEditableOnUpdate.includes(event.dataField)) {
            event.editorOptions.disabled = true;
        }
    }

    onToolbarPreparing = (e: any) => {
        e.toolbarOptions.items.unshift(
            // {
            //     location: 'before',
            // },
            {
                widget: 'dxButton',
                location: 'after',
                options: {
                    text: 'ייצוא לאקסל',
                    onClick: this.xlsOutput
                }
            },
            {
                location: 'after',
                widget: 'dxButton',
                options: {
                    icon: 'refresh',
                    onClick: this.refreshDataGrid.bind(this)
                }
            });
        e.toolbarOptions.items.push(
            {
                location: 'before',
                widget: 'dxDateBox',
                rtlEnabled: true,
                options: {
                    //searchEnabled: true,
                    showClearButton: true,
                    placeholder: "מתאריך",
                    displayFormat: "dd/MM/yyyy",
                    width: 150,
                    value: this.state.fromDate,
                    editEnabled: false,
                    onValueChanged: this.fromDateChanged.bind(this)
                }
            }, {
            location: 'before',
            widget: 'dxDateBox',
            rtlEnabled: true,
            options: {
                //searchEnabled: true,
                showClearButton: true,
                placeholder: "עד תאריך",
                displayFormat: "dd/MM/yyyy",
                width: 150,
                value: this.state.toDate,
                editEnabled: false,
                onValueChanged: this.toDateChanged.bind(this)
            }
        }, {
            location: 'before',
            widget: 'dxSelectBox',
            //locateInMenu: 'auto',
            rtlEnabled: true,
            options: {
                //searchEnabled: true,
                showClearButton: true,
                //width: 100,
                placeholder: "סניף",
                dataSource: this.state.branches,
                displayExpr: "Name",
                valueExpr: "BranchId",
                value: this.state.selectBranch,
                onValueChanged: this.selectBranchChanged.bind(this)
            }
        },
            // {
            //     location: 'before',
            //     widget: 'dxSelectBox',
            //     //locateInMenu: 'auto',
            //     rtlEnabled: true,
            //     options: {
            //         //searchEnabled: true,
            //         //showClearButton: true,
            //         //width: 100,
            //         placeholder: "מחלקה",
            //         dataSource: this.state.departments,
            //         displayExpr: "Name",
            //         valueExpr: "BranchId",
            //         value: this.state.selectDepartment,
            //         onValueChanged: this.setState({ selectBranch: e.value })
            //     }
            // }, 
            {
                widget: 'dxButton',
                location: "before",
                options: {
                    text: 'בצע',
                    type: 'normal',
                    onClick: this.reloadAllOrders
                }
            });
        // e.toolbarOptions.items.push({
        //     widget: 'dxButton',
        //     location: 'after',
        //     options: {
        //         text: 'טעינה מקובץ',
        //         onClick: this.showPopup
        //     }
        // });

        // e.toolbarOptions.items.push(
        //     {
        //         widget: 'dxDateBox',
        //         location: 'after',
        //         options: {
        //             value: this.state.searchDate,
        //             rtlEnabled: true,
        //             placeholder: "בחר תאריך...",
        //             displayFormat: "dd/MM/yyyy",
        //             acceptCustomValue: false,
        //             editEnabled: false,
        //             width: "120px",
        //             onValueChanged: this.changeDate.bind(this),
        //             onOpened: (e: any) => {
        //                 if (!e.component.option('isValid'))
        //                     e.component.reset();
        //             },
        //         }
        //     }
        // );
    }

    refreshDataGrid = () => {
        // https://js.devexpress.com/Documentation/Guide/Widgets/DataGrid/Filtering_and_Searching/
        this.dataGrid.clearFilter();
    }

    changeDate = (e: any) => {
        // console.log('date', e.value);
        this.setState({ searchDate: e.value });
        this.reloadAllOrders();
    }

    xlsOutput = async () => {
        console.log('xlsOutput');
        // Export XLSX file with errors:
        // https://github.com/SheetJS/sheetjs/issues/817

        this.dataGrid.saveEditData();
        let localGridData = new DataSource({
            store: this.state.orders,
            paginate: false
        });
        let orders: any[] = [];
        let item: CatalogItem;
        let branch: Branch;
        let user: User;
        let filterExpr = this.dataGrid.getCombinedFilter();
        localGridData.filter(filterExpr);
        localGridData.load().then(async (filterResult) => {
            for (var i = 0; i < filterResult.length; i++) {
                let selectOrder = this.state.orderNamesUnique.filter(order => order.OrderNum == filterResult[i].OrderNum)[0];
                if (typeof selectOrder != undefined) {
                    item = this.state.catalogs.filter(item => item.BarCode === filterResult[i].BarCode)[0];
                    branch = this.state.branches.filter(branch => branch.BranchId === filterResult[i].BranchId)[0];
                    user = this.state.users.filter(user => user.id === filterResult[i].CreatedBy)[0];
                    let order = {
                        OrderNum: filterResult[i].OrderNum,
                        BarCode: filterResult[i].BarCode,
                        ItemName: item.Name,
                        BranchId: filterResult[i].BranchId,
                        BranchName: branch.Name,
                        AmountOrdered: filterResult[i].AmountOrder,
                        OrderedByUser: filterResult[i].CreatedBy,
                        UserName: user.name,
                        OrderDate: Moment(filterResult[i].OrderDate).format('YYYY-MM-DD'),
                        AspakaDate: Moment(filterResult[i].AspakaDate).format('YYYY-MM-DD'),
                    }
                    orders.push(order);
                }
            }
        }).catch(err => {
            uiNotify(err, 'error');
        });
        let ws = XLSX.utils.json_to_sheet(orders);
        let wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "הזמנות");
        // This line for some reason is fired 3!! times
        // XLSX.writeFile(wb, "הזמנות.xlsx");

        // let orders: any[] = [];
        // let item: CatalogItem;
        // let branch: Branch;
        // let user: User;
        // for (let i = 0; i < this.state.orders.length; i++) {
        //     if (typeof this.state.orderNamesUnique.filter(order => order.OrderNum == this.state.orders[i].OrderNum)[0] != undefined) {
        //         item = this.state.catalogs.filter(item => item.BarCode === this.state.orders[i].BarCode)[0];
        //         branch = this.state.branches.filter(branch => branch.BranchId === this.state.orders[i].BranchId)[0];
        //         user = this.state.users.filter(user => user.id === this.state.orders[i].CreatedBy)[0];
        //         let order = {
        //             OrderNum: this.state.orders[i].OrderNum,
        //             BarCode: this.state.orders[i].BarCode,
        //             ItemName: item.Name,
        //             BranchId: this.state.orders[i].BranchId,
        //             BranchName: branch.Name,
        //             AmountOrdered: this.state.orders[i].AmountOrder,
        //             OrderedByUser: this.state.orders[i].CreatedBy,
        //             UserName: user.name,
        //             OrderDate: Moment(this.state.orders[i].OrderDate).format('YYYY-MM-DD'),
        //             AspakaDate: Moment(this.state.orders[i].AspakaDate).format('YYYY-MM-DD'),
        //         }
        //         orders.push(order);
        //     }
        // }
        // var ws = XLSX.utils.json_to_sheet(orders);
        // var wb = XLSX.utils.book_new();
        // XLSX.utils.book_append_sheet(wb, ws, "הזמנות");
        // XLSX.writeFile(wb, "הזמנות.xlsx");
    }

    fromDateChanged(e: any) {
        this.setState({ fromDate: e.value });
    }

    toDateChanged(e: any) {
        this.setState({ toDate: e.value });
    }

    selectBranchChanged(e: any) {
        this.setState({ selectBranch: e.value });
    }

    PrintCell = (CellData: any) => {
        return (
            // <ReactToPrint
            //     trigger={() => <div className="popup-field-button" style={{ color: "blue" }}><a onClick={() => this.setState({ printOrderNum: CellData.data.OrderNum })}>הדפס</a></div>}
            //     content={() => this.reportRef}
            // />
            <ReactToPrint
                trigger={() => <div className="popup-field-button" style={{ color: "blue" }}><a onClick={() => localStorage.setItem(LOCAL_ORDERNUM, CellData.data.OrderNum)}>הדפס</a></div>}
                content={() => this.reportRef}
            />
        );
    }

    componentWillUnmount() {
        this.dataGrid = null;
        this.reportRef = null;
        localStorage.removeItem(LOCAL_ORDERNUM);
    }

    render() {
        if (this.state.loading)
            return (
                <div className="app-loader">
                    <div className="loader" />
                </div>
            );

        return (
            <div className='grid-wrapper'>
                <div className='grid-body'>
                    <div className='container'>
                        <DataGrid id={'gridContainer'}
                            onInitialized={(ref) => { this.dataGrid = ref.component }}
                            dataSource={new DataSource({ store: this.state.orderNamesUnique, paginate: true })}
                            showColumnLines={true}
                            showRowLines={true}
                            showBorders={true}
                            rtlEnabled={true}
                            className="grid-element"
                            width={'100%'} //Hardcoded
                            rowAlternationEnabled={true}
                            onRowUpdated={(e) => this.onRowUpdated(e.data)}
                            onEditorPreparing={this.onEditorPreparing}
                            keyExpr={'key'}
                            onToolbarPreparing={this.onToolbarPreparing}
                        >
                            <FilterRow
                                visible={true}
                                applyFilter={'auto'}
                                showAllText={''}
                            ></FilterRow>
                            <HeaderFilter visible={true} />
                            <LoadPanel enabled={true} />

                            <Scrolling mode={'virtual'}></Scrolling>
                            <Paging enabled={false} />
                            <Editing
                                // mode={'row'}
                                mode={'popup'}
                                allowUpdating={this.props.permission.edit}
                                useIcons={true}>
                                <Popup title={'יום אספקה'} showTitle={true} width={350} height={150}>
                                </Popup>
                                <Form>
                                    <Item itemType={'group'} colCount={2}>
                                        <Item dataField={'AspakaDate'} cssClass={'Form-item-texteditor'} />
                                    </Item>
                                </Form>
                            </Editing>

                            <Column dataField={'OrderNum'} caption={'מספר הזמנה'}></Column>
                            <Column dataField={'SapakId'} caption={'ספק'} lookup={{
                                dataSource: this.state.suppliers,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'AspakaDate'} caption={'תאריך אספקה'} dataType={"date"} format={'dd-MM-yyyy'}><RequiredRule /></Column>
                            <Column dataField={'OrderDate'} caption={'תאריך הזמנה'} dataType={"date"} format={'dd-MM-yyyy'}></Column>
                            <Column dataField={'BranchId'} caption={'קוד סניף'} ></Column>
                            <Column dataField={'BranchName'} caption={'שם סניף'} lookup={{
                                dataSource: this.state.branches,
                                displayExpr: "Name",
                                valueExpr: "BranchId"
                            }}></Column>
                            <Column dataField={'Lines'} caption={'מספר שורות'} ></Column>
                            <Column dataField={'CreatedBy'} caption={'שולח'} lookup={{
                                dataSource: this.state.users,
                                displayExpr: "name",
                                valueExpr: "id"
                            }}></Column>
                            {/* <Column cellRender={this.PrintCell} width={50} alignment={'center'}></Column> */}
                            <MasterDetail
                                enabled={true}
                                // component={OrderItemsDetailTemplate}
                            />
                        </DataGrid>
                        <ReportTable
                            ref={(ref) => { this.reportRef = ref }}
                            // orderNum={this.state.printOrderNum}
                            orders={this.state.orders}
                            catalogs={this.state.catalogs}
                            users={this.state.users}
                        ></ReportTable>
                    </div>
                </div>
            </div>
        );
    }

}
/************************************************************************ Class ReportTable *************************************************************************/
type ReportTableProps = {
    // orderNum: number,
    orders: Order[],
    catalogs: CatalogItem[],
    users: User[]
};

class ReportTable extends Component<ReportTableProps>
{

    render() {
        const { // orderNum, 
            orders, catalogs, users } = this.props;

        let orderNum = checkIfNumber(localStorage.getItem(LOCAL_ORDERNUM));
        console.log('ReportTable', orderNum);

        if (orderNum === 0) return null;

        if (orderNum != 0) console.log("print", orderNum);

        let orderedByLine = "הוזמן על ידי " + users.filter(user => user.id === orders.filter(order => order.OrderNum == orderNum)[0].CreatedBy)[0].name;

        return (
            <div id="printable">
                <table>
                    <thead>
                        <tr>
                            <th align={'center'} colSpan={3}>הזמנה מספר {orderNum}</th>
                        </tr>
                        <tr>
                            <th align={'right'}>שם פריט</th>
                            <th>&emsp;&emsp;</th>
                            <th align={'center'}>כמות</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.filter(order => order.OrderNum == orderNum).map((order, i) => (
                            <tr key={"TR_" + order.BarCode}>
                                <td align={'right'} key={"TABLE_" + order.BarCode + '_1'}>{catalogs.filter(item => item.BarCode === order.BarCode)[0].Name}</td>
                                <td>&emsp;&emsp;</td>
                                <td align={'center'} key={"TABLE_" + order.BarCode + '_2'}>{order.AmountOrder}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td>&emsp;&emsp;</td>
                            <td>&emsp;&emsp;</td>
                            <td align={'left'}>{orderedByLine}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        )
    }
}

