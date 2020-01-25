import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { DataGrid } from 'devextreme-react';
import DataSource from 'devextreme/data/data_source';
import { FilterRow, HeaderFilter, LoadPanel, Paging, Editing, Popup, Form, Column, RequiredRule as devRequired, Scrolling, Export, MasterDetail, Texts } from 'devextreme-react/data-grid';
import { Popup as OutsidePopup } from 'devextreme-react/popup';
import { SelectBox } from 'devextreme-react';
import { TextBox } from 'devextreme-react/text-box';
import { Button } from 'devextreme-react/button';
import Validator, {
    RequiredRule,
    NumericRule,
    RangeRule
} from 'devextreme-react/validator';
import { ValidationGroup } from 'devextreme-react/validation-group';
import { Item } from 'devextreme-react/form';
import { Sapak, CatalogItem, Department, Order, User, UnitSize, OrderWithName, Branch, OrderWithNameUnique } from 'shared/interfaces/models/SystemModels';
import { getUsers, getOrdersByDate, getCatalogItems, getUnitSizes, updateOrderData, deleteOrder, getBranches, getDepartments, addOrder, getNextOrderNumber } from 'shared/api/order.provider';
import { uiNotify } from 'shared/components/Toast';
import XLSX from 'xlsx';
import { checkPageVersion } from 'shared/components/Version-control';
import { setVersionButton } from '../ManagePage';
import { checkPageToeknTime } from 'shared/components/Token-time-control';
import { RbacPermission } from 'shared/store/auth/auth.types';
import { confirm } from 'devextreme/ui/dialog';
import OrderItemsDetailTemplate from './OrderItemsDetail';
import DevExpress from 'devextreme/bundles/dx.all';
import ReactToPrint from 'react-to-print';
import { checkIfNumber } from 'shared/auth/auth.service';
import { getSapaks, getItemById } from 'shared/api/catalogItem.provider';
import Moment from 'moment';
import { AuthUser } from 'shared/interfaces/models/User';

const LOCAL_ORDERNUM = "local_OrderNumData";

type SupplierOrdersProps = {
    permission: RbacPermission,
    user: AuthUser;
} & RouteComponentProps;

type SupplierOrdersState = {
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
    printOrderNum: number
    searchDate: Date
}
export class SupplierOrders extends Component<SupplierOrdersProps> {
    dataGrid: any | null = null;
    reportRef: any | null = null;
    validationGroupRef: any = React.createRef();
    validatorRef1: any = React.createRef();
    validatorRef2: any = React.createRef();
    validatorRef3: any = React.createRef();
    selectBoxSuppRef: any = React.createRef();
    selectBoxBranchRef: any = React.createRef();
    selectBoxItemRef: any = React.createRef();
    textBoxRef: any = React.createRef();
    state: SupplierOrdersState = {
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
        selectDepartment: 1,
        printOrderNum: 0,
        searchDate: new Date()
    }

    get textBox() {
        return this.textBoxRef.current.instance;
    }

    get selectBoxSupp() {
        return this.selectBoxSuppRef.current.instance;
    }

    get selectBoxBranch() {
        return this.selectBoxBranchRef.current.instance;
    }

    get selectBoxItem() {
        return this.selectBoxItemRef.current.instance;
    }

    get validationGroup() {
        return this.validationGroupRef.current.instance;
    }

    get validatorBranch() {
        return this.validatorRef1.current.instance;
    }

    get validatorItem() {
        return this.validatorRef2.current.instance;
    }

    get validatorAmount() {
        return this.validatorRef3.current.instance;
    }

    resetTextBox = () => {
        this.textBox.reset();
    };

    resetSelectBoxBranch = () => {
        this.selectBoxBranch.reset();
    };

    resetSelectBoxSupp = () => {
        this.selectBoxSupp.reset();
    };

    resetSelectBoxItem = () => {
        this.selectBoxItem.reset();
    };

    resetValidationGroup = () => {
        this.validationGroup.reset();
    }

    resetValidatorBranch = () => {
        this.validatorBranch.reset();
    }

    resetValidatorItem = () => {
        this.validatorItem.reset();
    }

    resetValidatorAmount = () => {
        this.validatorAmount.reset();
    }

    updatePopupVisibility = (isPopupVisible: boolean): void => {
        this.setState({ isPopupVisible });
    }

    closeForm() {
        this.updatePopupVisibility(false);
        // clear the Form data fields
        this.resetTextBox();
        this.resetSelectBoxSupp();
        this.resetSelectBoxBranch();
        this.resetSelectBoxItem();
        //this.resetValidationGroup();
    }

    refreshForm() {
        // clear the Form data fields
        this.resetTextBox();
        this.resetSelectBoxBranch();
        this.resetSelectBoxItem();
        //this.resetValidationGroup();
        this.resetValidatorBranch();
        this.resetValidatorItem();
        this.resetValidatorAmount();
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
            let orders = await getOrdersByDate(Moment(this.state.searchDate).format('YYYY-MM-DD'));

            orders = orders.filter(order => order.OrderNum === 0);
            if (this.state.selectDepartment != 0)
                orders = orders.filter(order => typeof this.state.catalogs.filter(item => item.BarCode === order.BarCode
                    && item.ClassesId === this.state.selectDepartment)[0] != 'undefined');
            this.setState({ orders });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
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
                location: 'after',
                widget: 'dxButton',
                options: {
                    text: 'ייצוא הזמנות',
                    onClick: this.createSuppOrders
                }
            },
            {
                location: 'after',
                widget: 'dxButton',
                options: {
                    icon: 'add',
                    onClick: this.showPopup
                }
            },
            {
                location: 'after',
                widget: 'dxButton',
                options: {
                    icon: 'refresh',
                    onClick: this.refreshDataGrid.bind(this)
                }
            },
            {
                location: 'after',
                widget: 'dxSelectBox',
                //locateInMenu: 'auto',
                //rtlEnabled: true,
                options: {
                    //searchEnabled: true,
                    //showClearButton: true,
                    width: 100,
                    placeholder: "מחלקה",
                    dataSource: this.state.departments,
                    displayExpr: "Name",
                    valueExpr: "Id",
                    value: this.state.selectDepartment,
                    onValueChanged: this.selectDepartmentChanged.bind(this)
                }
            },
            // {
            //     widget: 'dxButton',
            //     location: 'after',
            //     options: {
            //         text: 'ייצוא לאקסל',
            //         onClick: this.xlsOutput
            //     }
            // }, 
        );
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
        e.toolbarOptions.items.push(
            {
                widget: 'dxDateBox',
                location: 'after',
                options: {
                    value: this.state.searchDate,
                    rtlEnabled: true,
                    placeholder: "בחר תאריך...",
                    displayFormat: "dd/MM/yyyy",
                    acceptCustomValue: false,
                    editEnabled: false,
                    width: "120px",
                    onValueChanged: this.changeDate.bind(this),
                    onOpened: (e: any) => {
                        if (!e.component.option('isValid'))
                            e.component.reset();
                    },
                }
            }
        );
    }

    showPopup = () => {
        this.updatePopupVisibility(true);
    }

    changeDate = (e: any) => {
        // console.log('date', e.value);
        this.setState({ searchDate: e.value });
        this.reloadAllOrders();
    }

    refreshDataGrid = () => {
        // https://js.devexpress.com/Documentation/Guide/Widgets/DataGrid/Filtering_and_Searching/
        this.dataGrid.clearFilter();
    }

    xlsOutput = () => {
        // Export XLSX file with errors:
        // https://github.com/SheetJS/sheetjs/issues/817
        // let orders = new DataSource({
        //     store: this.state.orderNamesUnique
        // });
        // if (this.dataGrid != undefined) {
        //     orders.filter(this.dataGrid.getCombinedFilter());
        // }
        let orders = [];
        let item: CatalogItem;
        let branch: Branch;
        let user: User;
        for (let i = 0; i < this.state.orders.length; i++) {
            if (typeof this.state.orderNamesUnique.filter(order => order.OrderNum == this.state.orders[i].OrderNum)[0] != undefined) {
                item = this.state.catalogs.filter(item => item.BarCode === this.state.orders[i].BarCode)[0];
                branch = this.state.branches.filter(branch => branch.BranchId === this.state.orders[i].BranchId)[0];
                user = this.state.users.filter(user => user.id === this.state.orders[i].CreatedBy)[0];
                let order = {
                    OrderNum: this.state.orders[i].OrderNum,
                    BarCode: this.state.orders[i].BarCode,
                    ItemName: item.Name,
                    BranchId: this.state.orders[i].BranchId,
                    BranchName: branch.Name,
                    AmountOrdered: this.state.orders[i].AmountOrder,
                    OrderedByUser: this.state.orders[i].CreatedBy,
                    UserName: user.name,
                    OrderDate: Moment(this.state.orders[i].OrderDate).format('YYYY-MM-DD'),
                    AspakaDate: Moment(this.state.orders[i].AspakaDate).format('YYYY-MM-DD'),
                }
                orders.push(order);
            }
        }
        var ws = XLSX.utils.json_to_sheet(orders);
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "הזמנות");
        XLSX.writeFile(wb, "הזמנות.xlsx");
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

    selectDepartmentChanged(e: any) {
        this.setState({ selectDepartment: e.value });
        this.reloadAllOrders();
    }

    createSuppOrders = async () => {
        const { user } = this.props;
        this.dataGrid.saveEditData();
        let localGridData = new DataSource({
            store: this.state.orders,
            paginate: false
        });
        let selectedOrders: Order[] = [];
        let selectedSuppliers: number[] = [];
        let filterExpr = this.dataGrid.getCombinedFilter();
        localGridData.filter(filterExpr);
        localGridData.load().then(async (filterResult) => {
            // get all selected orders into a new array
            for (var i = 0; i < filterResult.length; i++) {
                selectedOrders.push(filterResult[i]);
            }
            // now that we have all the selected orders get unique suppliers
            const map = new Map();
            let length = selectedOrders.length;
            for (let y = 0; y < length; y++) {
                if (!map.has(selectedOrders[y].SapakId)) {
                    map.set(selectedOrders[y].SapakId, true);    // set a unique value to Map
                    selectedSuppliers.push(selectedOrders[y].SapakId);
                }
            }
            // create a single order for each supplier
            let suppLength = selectedSuppliers.length;
            for (let n = 0; n < suppLength; n++) {
                let orderSupp = selectedOrders.filter(order => order.SapakId === selectedSuppliers[n]);
                let suppOrderLength = orderSupp.length;
                let today = new Date();
                const orderNumber = await getNextOrderNumber();
                for (let p = 0; p < suppOrderLength; p++) {
                    let branch = this.state.branches.filter(branch => branch.BranchId === orderSupp[p].BranchId)[0];
                    await addOrder(
                        orderNumber,                                                    //OrderNum - the same for all lines with the same Supplier,
                        branch.NetworkId,
                        orderSupp[p].BarCode,
                        orderSupp[p].GroupId,
                        selectedSuppliers[n],                                           // Supplier Id
                        orderSupp[p].AmountOrder,                                       // Amount Ordered
                        orderSupp[p].BranchId,
                        user.id,                                                        // CreatedBy
                        new Date(Moment(today).format('YYYY-MM-DD')),                   // OrderDate
                        new Date(Moment(orderSupp[p].AspakaDate).format('YYYY-MM-DD')), // DeliveryDate
                    ).then(async () => {

                    }).catch(err => {
                        uiNotify(err, 'error');
                    })
                }
            }
            // update the page to reflect the new orders 
            // (all orders with an OrderNum != 0 are only shown in orderItems page)
            this.reloadAllOrders();
        }).catch(err => {
            uiNotify(err, 'error');
        });
    }

    addFormOrder = async (e: any) => {
        if (e.target != null && e.target.SupplierId != null && typeof e.target.BarCode.value === 'undefined') {
            uiNotify("חייבים למלא ערך", 'error');
            return;
        }
        if (e.target != null && e.target.BarCode != null && typeof e.target.BarCode.value != 'undefined') {
            const { user } = this.props;
            let barCode = e.target.BarCode.value;
            let item = await getItemById(barCode);
            let branch = this.state.branches.filter(branch => branch.BranchId === parseInt(e.target.BranchId.value))[0];
            let today = new Date();
            // console.log(e.target.SupplierId.value, e.target.BranchId.value, e.target.BarCode.value, e.target.OrderAmount.value, branch.NetworkId, user);
            await addOrder(
                0, //OrderNum - will be set in supplier order screen,
                branch.NetworkId,
                item[0].BarCode,
                item[0].GroupId,
                e.target.SupplierId.value,
                e.target.OrderAmount.value,
                e.target.BranchId.value,
                user.id, //CreatedBy
                new Date(Moment(today).format('YYYY-MM-DD')), // OrderDate
                new Date(Moment(today).format('YYYY-MM-DD')), // DeliveryDate
            ).then(async () => {

            }).catch(err => {
                uiNotify(err, 'error');
            })
            // update the page to reflect the new order and SiryunOrder
            this.reloadAllOrders();
        }
        //refresh form
        this.refreshForm();
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
                            dataSource={new DataSource({ store: this.state.orders, paginate: true })}
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
                                mode={'cell'}
                                allowUpdating={this.props.permission.edit}
                                useIcons={true}>
                            </Editing>

                            <Column dataField={'SapakId'} caption={'ספק'} width={100} allowEditing={false} lookup={{
                                dataSource: this.state.suppliers,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'NetworkId'} caption={'רשת'} allowEditing={false} width={60}></Column>
                            <Column dataField={'BranchId'} caption={'קוד סניף'} allowEditing={false} width={80}></Column>
                            <Column dataField={'BranchId'} caption={'שם סניף'} allowEditing={false} lookup={{
                                dataSource: this.state.branches,
                                displayExpr: "Name",
                                valueExpr: "BranchId"
                            }}></Column>
                            {/* <Column dataField={'OrderNum'} caption={'מספר הזמנה'}></Column> */}
                            <Column dataField={'BarCode'} caption={'מס פריט'} allowEditing={false}></Column>
                            <Column dataField={'BarCode'} caption={'שם פריט'} allowEditing={false} lookup={{
                                dataSource: this.state.catalogs,
                                displayExpr: "Name",
                                valueExpr: "BarCode"
                            }}></Column>
                            <Column dataField={'AspakaDate'} caption={'תאריך אספקה'} dataType={"date"} format={'dd-MM-yyyy'} allowEditing={false} width={110}></Column>
                            <Column dataField={'AmountOrder'} caption={'כמות'} width={60}></Column>
                            <Column dataField={'CreatedBy'} caption={'שולח'} allowEditing={false} visible={false} lookup={{
                                dataSource: this.state.users,
                                displayExpr: "name",
                                valueExpr: "id"
                            }}></Column>
                            {/* <Column cellRender={this.PrintCell} width={50} alignment={'center'}></Column> */}
                        </DataGrid>
                        <OutsidePopup title={'הוספת פריט'}
                            key="OUTSIDE_ORDER_POP"
                            deferRendering
                            dragEnabled={true}
                            showTitle={true}
                            rtlEnabled
                            closeOnOutsideClick={false}
                            width={300}
                            height={230}
                            visible={this.state.isPopupVisible}
                            onHiding={() => this.closeForm()}
                            contentRender={(pros: any) => {
                                return (
                                    <div className='grid-wrapper' >
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            e.persist();
                                            this.addFormOrder(e);
                                        }}>
                                            <div className="popup-container">
                                                <ValidationGroup
                                                    ref={this.validationGroupRef}>
                                                    <div className="popup-row">
                                                        <div className="popup-field-label">שם ספק:</div>
                                                        <div className="popup-field">
                                                            <SelectBox id="SupplierId" name="SupplierId"
                                                                //ref={(ref) => this.selectBoxRef = ref}
                                                                ref={this.selectBoxSuppRef}
                                                                searchEnabled={true}
                                                                dataSource={{
                                                                    store: this.state.suppliers,
                                                                    paginate: true,
                                                                    pageSize: 15
                                                                }}
                                                                valueExpr={'Id'}
                                                                displayExpr={'Name'}
                                                                placeholder={'בחר ספק'}
                                                                rtlEnabled={true}
                                                                showClearButton={true}
                                                            >
                                                                <Validator >
                                                                    <RequiredRule message={"חייבים למלא ערך"} />
                                                                </Validator>
                                                            </SelectBox>
                                                        </div>
                                                    </div>
                                                    <div className="popup-row">
                                                        <div className="popup-field-label">שם סניף:</div>
                                                        <div className="popup-field">
                                                            <SelectBox id="BranchId" name="BranchId"
                                                                //ref={(ref) => this.selectBoxRef = ref}
                                                                ref={this.selectBoxBranchRef}
                                                                searchEnabled={true}
                                                                dataSource={{
                                                                    store: this.state.branches,
                                                                    paginate: true,
                                                                    pageSize: 15
                                                                }}
                                                                valueExpr={'BranchId'}
                                                                displayExpr={'Name'}
                                                                placeholder={'בחר סניף'}
                                                                rtlEnabled={true}
                                                                showClearButton={true}>
                                                                <Validator
                                                                ref={this.validatorRef1}>
                                                                    <RequiredRule message={"חייבים למלא ערך"} />
                                                                </Validator>
                                                            </SelectBox>
                                                        </div>
                                                    </div>
                                                    <div className="popup-row">
                                                        <div className="popup-field-label">שם פריט:</div>
                                                        <div className="popup-field">
                                                            <SelectBox id="BarCode" name="BarCode"
                                                                //ref={(ref) => this.selectBoxRef = ref}
                                                                ref={this.selectBoxItemRef}
                                                                searchEnabled={true}
                                                                dataSource={{
                                                                    store: this.state.catalogs,
                                                                    paginate: true,
                                                                    pageSize: 15
                                                                }}
                                                                valueExpr={'BarCode'}
                                                                displayExpr={'Name'}
                                                                placeholder={'בחר פריט'}
                                                                rtlEnabled={true}
                                                                showClearButton={true}>
                                                                <Validator
                                                                ref={this.validatorRef2}>
                                                                    <RequiredRule message={"חייבים למלא ערך"} />
                                                                </Validator>
                                                            </SelectBox>
                                                        </div>
                                                    </div>
                                                    <div className="popup-row">
                                                        <div className="popup-field-label">כמות:</div>
                                                        <div className="popup-field">
                                                            {/* <NumberBox id="OrderAmount" name="OrderAmount" */}
                                                            <TextBox id="OrderAmount" name="OrderAmount"
                                                                ref={this.textBoxRef}
                                                                showClearButton={true}
                                                            >
                                                                <Validator
                                                                ref={this.validatorRef3}>
                                                                    <RequiredRule message={"חייבים למלא ערך"} />
                                                                    <NumericRule message={"ערך חייב להיות מספרי"} />
                                                                    <RangeRule message="חייבים למלא ערך גדול מ 0" min={1} />
                                                                </Validator>
                                                            </TextBox>
                                                            {/* </NumberBox> */}
                                                        </div>
                                                    </div>
                                                    <div className="popup-row-buttons">
                                                        <div className="popup-buttons">
                                                            <Button text={'הוסף'} useSubmitBehavior style={{ margin: "10px 0px 3px 0px" }}></Button>
                                                        </div>
                                                    </div>
                                                </ValidationGroup>
                                            </div>
                                        </form>
                                    </div>
                                )
                            }}>
                        </OutsidePopup>
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
        //console.log('ReportTable', orderNum);

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

