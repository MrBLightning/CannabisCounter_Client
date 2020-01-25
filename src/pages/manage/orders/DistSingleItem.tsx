import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { DataGrid, SelectBox, TextBox, Button, NumberBox } from 'devextreme-react';
import DataSource from 'devextreme/data/data_source';
import { FilterRow, HeaderFilter, LoadPanel, Paging, Editing, Column, Scrolling, Summary, TotalItem } from 'devextreme-react/data-grid';
import Validator, {
    RequiredRule,
    NumericRule,
    RangeRule
} from 'devextreme-react/validator';
import { CatalogItem, Group, Sapak, Branch, ReservedOrder, BranchNetwork, SingleSupplierItem } from 'shared/interfaces/models/SystemModels';
import {
    getItems, getGroups, getSapakim, getBranches, getBranchNetworks, addInternalOrder, getNextInternalOrderNumber,
    addLatestReservedOrders, getReservedOrdersByDate, addReservedOrder, updateReservedOrder, getSingleSupplierItems
} from 'shared/api/distSingleItem.provider';
import { uiNotify } from 'shared/components/Toast';
import { checkPageVersion } from 'shared/components/Version-control';
import { checkPageToeknTime } from 'shared/components/Token-time-control';
import { RbacPermission } from 'shared/store/auth/auth.types';
import { AuthUser } from 'shared/interfaces/models/User';
import XLSX from 'xlsx';
import Moment from 'moment';
import { Popup as OutsidePopup } from 'devextreme-react/popup';
import { getItemById } from 'shared/api/catalogItem.provider';
import { addOrder } from 'shared/api/order.provider';

type DistSingleItemProps = {
    permission: RbacPermission,
    user: AuthUser;
} & RouteComponentProps;

type DistSingleItemState = {
    catalogs: CatalogItem[],
    singleSupplierItems: SingleSupplierItem[],
    branches: Branch[],
    branchNetworks: BranchNetwork[],
    reservedOrders: ReservedOrder[],
    myReservedOrders: ReservedOrder[],
    suppliers: Sapak[],
    groups: Group[],
    searchDate: Date,
    includeSentOrders: boolean,
    isPopupVisible: boolean,
    loading: boolean,
    userMessage: string,
}
export class DistSingleItem extends Component<DistSingleItemProps> {
    dataGrid: any | null = null;
    selectBoxBranchRef: any = React.createRef();
    selectBoxItemRef: any = React.createRef();
    textBoxRef: any = React.createRef();
    state: DistSingleItemState = {
        catalogs: [],
        singleSupplierItems: [],
        branches: [],
        branchNetworks: [],
        reservedOrders: [],
        myReservedOrders: [],
        suppliers: [],
        groups: [],
        searchDate: new Date(),
        includeSentOrders: false,
        isPopupVisible: false,
        loading: true,
        userMessage: ''
    }

    get textBox() {
        if (this.textBoxRef.current)
            return this.textBoxRef.current.instance;
    }

    get selectBoxBranch() {
        if (this.selectBoxBranchRef.current)
            return this.selectBoxBranchRef.current.instance;
    }

    get selectBoxItem() {
        if (this.selectBoxItemRef.current)
            return this.selectBoxItemRef.current.instance;
    }

    resetTextBox = () => {
        if (this.textBox)
            this.textBox.reset()
    };

    resetSelectBoxBranch = () => {
        if (this.selectBoxBranch)
            this.selectBoxBranch.reset()
    };

    resetSelectBoxItem = () => {
        if (this.selectBoxItem)
            this.selectBoxItem.reset()
    };

    loadAllBranches = async (): Promise<void> => {
        try {
            let branches = await getBranches();
            this.setState({ branches });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    closeForm() {
        // clear the Form data fields
        this.resetSelectBoxBranch();
        this.resetSelectBoxItem();
        this.resetTextBox();
        // hide form popup
        this.updatePopupVisibility(false);
    }

    updatePopupVisibility = (isPopupVisible: boolean): void => {
        this.setState({ isPopupVisible });
    }

    loadAllBranchNetworks = async (): Promise<void> => {
        try {
            let branchNetworks = await getBranchNetworks();
            this.setState({ branchNetworks });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllGroups = async (): Promise<void> => {
        try {
            let groups = await getGroups();
            this.setState({ groups });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllSapakim = async (): Promise<void> => {
        try {
            let suppliers = await getSapakim();
            this.setState({ suppliers });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllItems = async (): Promise<void> => {
        try {
            let catalogs = await getItems();
            // We only present on this page items that have a SapakId defined in catalogs
            // catalogs = catalogs.filter(catalog => catalog.SapakId > 0);
            this.setState({ catalogs });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllSingleSupplierItems = async (): Promise<void> => {
        try {
            let singleSupplierItems = await getSingleSupplierItems();
            this.setState({ singleSupplierItems });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    reloadAllReservedOrders = async (): Promise<void> => {
        try {
            this.setState({ loading: true })
            // Add the latest orders to reserved_order table
            await addLatestReservedOrders();
            // Get all reserved_order records for selected date
            let initReservedOrders = await getReservedOrdersByDate(Moment(this.state.searchDate).format('YYYY-MM-DD'));
            console.log('initReservedOrders', initReservedOrders);
            let reservedOrders: ReservedOrder[] = [];
            let length = initReservedOrders.length;
            // Present only items that appear in catalogs (have a SapakId defined)
            for (let i = 0; i < length; i++) {
                let avail = this.state.singleSupplierItems.filter(item => item.BarCode === initReservedOrders[i].BarCode)[0];
                if (typeof avail != 'undefined') {
                    initReservedOrders[i].AmountDiff = initReservedOrders[i].AmountApproved - initReservedOrders[i].AmountOrdered;
                    reservedOrders.push(initReservedOrders[i]);
                }
            }
            console.log('reservedOrders', reservedOrders);
            let myReservedOrders: ReservedOrder[] = [];
            if (!this.state.includeSentOrders)
                myReservedOrders = reservedOrders.filter(line => line.IsOrderSent === 0);
            else myReservedOrders = reservedOrders;
            this.setState({ reservedOrders, myReservedOrders });
            this.setState({ loading: false })
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    addReservedOrder = async (DeliveryDate: Date, OrderDate: Date, BarCode: number, NetworkId: number,
        BranchId: number, ClassId: number, GroupId: number, SupplierId: number, OrderNum: number,
        AmountOrdered: number, AmountApproved: number, CreatedBy: number, IsOrderSent: number, RecordType: string): Promise<void> => {
        await addReservedOrder(new Date(Moment(DeliveryDate).format('YYYY-MM-DD')), new Date(Moment(OrderDate).format('YYYY-MM-DD')),
            BarCode, NetworkId, BranchId, ClassId, GroupId, SupplierId, OrderNum,
            AmountOrdered, AmountApproved, CreatedBy, IsOrderSent, RecordType);
    }

    updateReservedOrder = async (Id: number, DeliveryDate: Date, OrderDate: Date, BarCode: number, NetworkId: number,
        BranchId: number, ClassId: number, GroupId: number, SupplierId: number, OrderNum: number, AmountOrdered: number,
        AmountApproved: number, CreatedBy: number, IsOrderSent: number, RecordType: string): Promise<void> => {
        await updateReservedOrder(Id, new Date(Moment(DeliveryDate).format('YYYY-MM-DD')), new Date(Moment(OrderDate).format('YYYY-MM-DD')),
            BarCode, NetworkId, BranchId, ClassId, GroupId, SupplierId, OrderNum,
            AmountOrdered, AmountApproved, CreatedBy, IsOrderSent, RecordType);
    }

    // deleteDepartment = async (Id: number): Promise<void> => {
    //     await deleteDepartment(Id);
    // }

    init = async () => {
        await this.loadAllBranches();
        await this.loadAllBranchNetworks();
        await this.loadAllGroups();
        await this.loadAllSapakim();
        await this.loadAllItems();
        await this.loadAllSingleSupplierItems();
        await this.reloadAllReservedOrders();
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
    };


    // part of the DataGrid life-cycle. Happens everytime a line is updated in the page table
    onRowUpdated(e: any) {
        this.updateReservedOrder(e.Id, e.DeliveryDate, e.OrderDate, e.BarCode, e.NetworkId, e.BranchId, e.ClassId, e.GroupId, e.SupplierId,
            e.OrderNum, e.AmountOrdered, e.AmountApproved, e.CreatedBy, 0, e.RecordType).then(() => {
            }).catch(err => {
                uiNotify(err, 'error');
            })
        this.reloadAllReservedOrders();
    }

    onToolbarPreparing = (e: any) => {
        e.toolbarOptions.items.unshift(
            {
                location: 'after',
                widget: 'dxButton',
                visible: false,
                options: {
                    icon: 'refresh',
                    onClick: this.refreshDataGrid.bind(this)
                }
            },
            {
                location: 'after',
                widget: 'dxButton',
                options: {
                    text: 'ייצוא הזמנות',
                    onClick: this.saveOrders
                }
            },
            {
                location: 'after',
                widget: 'dxButton',
                options: {
                    text: 'הזמנות חדשות',
                    onClick: this.reloadDataGrid.bind(this)
                }
            },
            {
                location: 'after',
                widget: 'dxButton',
                options: {
                    text: 'אקסל מסכם',
                    onClick: this.xlsOutput
                }
            },
            {
                location: 'after',
                widget: 'dxButton',
                options: {
                    text: 'כולל הזמנות שנשלחו',
                    onClick: this.toggleSentOrders
                }
            },
            {
                location: 'after',
                widget: 'dxButton',
                options: {
                    text: 'הוספת פריט',
                    onClick: this.showPopup
                }
            }
        );
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

    reloadDataGrid = (e: any) => {
        this.reloadAllReservedOrders();
    }

    toggleSentOrders = () => {
        this.setState({ includeSentOrders: !this.state.includeSentOrders });
        this.reloadAllReservedOrders();
    }

    saveOrders = () => {
        const { user } = this.props;
        this.dataGrid.saveEditData();
        let localGridData = new DataSource({
            store: this.state.myReservedOrders,
            paginate: false
        });
        let filterExpr = this.dataGrid.getCombinedFilter();
        localGridData.filter(filterExpr);
        localGridData.load().then(async (filterResult) => {
            for (var i = 0; i < filterResult.length; i++) {
                let line = filterResult[i];
                //let orderDate = new Date(Moment(new Date()).format('YYYY-MM-DD'));
                await addOrder(
                    0, //OrderNum - will be set in supplier order screen,
                    line.NetworkId,
                    line.BarCode,
                    line.GroupId,
                    line.SupplierId,
                    line.AmountApproved,
                    line.BranchId,
                    user.id, //CreatedBy
                    line.OrderDate,
                    line.DeliveryDate,
                ).then(async () => {
                    // Now we need to update the ReservedOrder IsOrderSent variable to '1'
                    await this.updateReservedOrder(
                        line.Id,
                        line.DeliveryDate,
                        line.OrderDate,
                        line.BarCode,
                        line.NetworkId,
                        line.BranchId,
                        line.ClassId,
                        line.GroupId,
                        line.SupplierId,
                        line.OrderNum,
                        line.AmountOrdered,
                        line.AmountApproved,
                        line.CreatedBy,
                        1,
                        line.RecordType
                    ).then(() => {
                    }).catch(err => {
                        uiNotify(err, 'error');
                    })
                }).catch(err => {
                    uiNotify(err, 'error');
                })
            }
            // update the page to reflect the new order and SiryunOrder
            this.reloadAllReservedOrders();
        }).catch(err => {
            uiNotify(err, 'error');
        });
    }

    xlsOutput = () => {
        // Export XLSX file todays' item distribution records:
        // https://github.com/SheetJS/sheetjs/issues/817
        let length = this.state.myReservedOrders.length;
        let myRecords = [];
        for (let i = 0; i < length; i++) {
            let records = {
                DeliveryDate: Moment(this.state.myReservedOrders[i].DeliveryDate).format('YYYY-MM-DD'),
                NetworkId: this.state.myReservedOrders[i].NetworkId,
                BranchId: this.state.myReservedOrders[i].BranchId,
                GroupId: this.state.myReservedOrders[i].GroupId,
                BarCode: this.state.myReservedOrders[i].BarCode,
                OrderNum: this.state.myReservedOrders[i].OrderNum,
                RecordType: this.state.myReservedOrders[i].RecordType,
                AmountOrdered: this.state.myReservedOrders[i].AmountOrdered,
                AmountDiff: this.state.myReservedOrders[i].AmountDiff,
                AmountApproved: this.state.myReservedOrders[i].AmountApproved,
                SupplierId: this.state.myReservedOrders[i].SupplierId,
                IsOrderSent: this.state.myReservedOrders[i].IsOrderSent,
                CreatedBy: this.state.myReservedOrders[i].CreatedBy,
            }
            myRecords.push(records);
        }
        var ws = XLSX.utils.json_to_sheet(myRecords);
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "חלוקת פריט");
        XLSX.writeFile(wb, "חלוקת-פריט.xlsx");
    }

    changeDate = (e: any) => {
        // console.log('date', e.value);
        this.setState({ searchDate: e.value });
        this.reloadAllReservedOrders();
    }

    refreshDataGrid() {
        this.dataGrid.clearFilter();
    }

    addFormOrder = async (e: any) => {
        if (e.target != null && e.target.BarCode != null && typeof e.target.BarCode.value != 'undefined') {
            const { user } = this.props;
            const orderNumber = await getNextInternalOrderNumber();
            let barCode = e.target.BarCode.value;
            let item = await getItemById(barCode);
            // console.log(item[0]);
            await addInternalOrder(
                e.target.BranchId.value,
                orderNumber,
                new Date(Moment(this.state.searchDate).format('YYYY-MM-DD')),
                item[0].BarCode,
                item[0].GroupId,
                item[0].SapakId, //SupplierId
                e.target.OrderAmount.value,
                new Date(Moment(this.state.searchDate).format('YYYY-MM-DD')),
                user.id //CreatedBy
            ).then(() => {

            }).catch(err => {
                uiNotify(err, 'error');
            })
            // update the page to reflect the new order and SiryunOrder
            this.reloadAllReservedOrders();
        }
        //close the form
        this.closeForm();
    }


    componentWillUnmount() {
        this.dataGrid = null;
    }

    onCellPrepared = (e: any) => {
        switch (e.rowType) {
            case "data":
                {
                    let fieldData = e.value;
                    if (fieldData && fieldData < 0) {
                        e.cellElement.style.color = 'red';
                    }
                    if (e.data.IsOrderSent >= 1) {
                        e.cellElement.style.background = 'lightgreen'; // pending order
                    }
                    break;
                }
            case "group":
                {
                    var sumItems = e.summaryItems;
                    if (sumItems && sumItems.length > 0 && sumItems[0] && sumItems[0].value < 0) {
                        e.cellElement.style.color = 'red';
                    }
                }
        }
    }

    customizeText = (cellInfo: any) => {
        if (cellInfo.value === 0 || typeof cellInfo.value === 'undefined' || cellInfo.value === null) {
            return '';
        } else return cellInfo.value + '';
    }

    render() {
        const { branches, branchNetworks, suppliers, groups, catalogs, loading } = this.state;

        if (loading)
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
                            dataSource={new DataSource({ store: this.state.myReservedOrders, paginate: false })}
                            showColumnLines={true}
                            showRowLines={true}
                            showBorders={true}
                            rtlEnabled={true}
                            className="grid-element"
                            width={'100%'} //Hardcoded
                            rowAlternationEnabled={true}
                            wordWrapEnabled={true}
                            onRowUpdated={(e) => this.onRowUpdated(e.data)}
                            onCellPrepared={(e) => this.onCellPrepared(e)}
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

                            <Column dataField={'NetworkId'} caption={'רשת'} allowEditing={false} dataType={'number'} width={60}
                            // lookup={{
                            //     dataSource: () => branchNetworks,
                            //     displayExpr: "Name",
                            //     valueExpr: "Id"
                            // }} 
                            />
                            <Column dataField={'SupplierId'} caption={'ספק'} allowEditing={false} dataType={'number'}
                                lookup={{
                                    dataSource: () => suppliers,
                                    displayExpr: "Name",
                                    valueExpr: "Id"
                                }} />
                            <Column dataField={'BranchId'} caption={'סניף'} allowEditing={false} dataType={'number'} width={120}
                                lookup={{
                                    dataSource: () => branches,
                                    displayExpr: "Name",
                                    valueExpr: "BranchId"
                                }} />
                            <Column dataField={'GroupId'} caption={'קבוצה'} allowEditing={false} dataType={'number'}
                                lookup={{
                                    dataSource: () => groups,
                                    displayExpr: "Name",
                                    valueExpr: "Id"
                                }} />
                            <Column dataField={'BarCode'} caption={'פריט'} allowEditing={false} dataType={'number'} width={200}
                                lookup={{
                                    dataSource: () => catalogs,
                                    displayExpr: "Name",
                                    valueExpr: "BarCode"
                                }} />
                            <Column dataField={'OrderNum'} caption={'מס הזמנה'} allowEditing={false} dataType={'number'} />
                            <Column dataField={'OrderDate'} caption={'תאריך הזמנה'} allowEditing={false} dataType={"date"} format={'dd-MM-yyyy'} visible={false} />
                            <Column dataField={'DeliveryDate'} caption={'תאריך אספקה'} allowEditing={false} dataType={"date"} format={'dd-MM-yyyy'} />
                            <Column dataField={'AmountOrdered'} caption={'הוזמן'} allowEditing={false} dataType={'number'} />
                            <Column dataField={'AmountDiff'} caption={'ביקורת'} allowEditing={false} dataType={'number'} format={'#0;#-'} />
                            <Column dataField={'AmountApproved'} caption={'חולק'} dataType={'number'} />
                            <Column dataField={'IsOrderSent'} caption={'נשלח'} allowEditing={false} dataType={'boolean'} visible={false} />
                            <Summary>
                                <TotalItem
                                    column={'AmountApproved'}
                                    summaryType={'sum'}
                                    displayFormat={'סהכ {0}'} />
                            </Summary>
                        </DataGrid>
                        <OutsidePopup title={'הוספת פריט'}
                            key="OUTSIDE_ORDER_POP"
                            deferRendering
                            dragEnabled={true}
                            showTitle={true}
                            rtlEnabled
                            closeOnOutsideClick={false}
                            width={300}
                            height={200}
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
                                                            <Validator>
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
                                                            <Validator>
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
                                                            <Validator>
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
                                                        <Button text={'בצע'} useSubmitBehavior style={{ margin: "10px 0px 3px 0px" }}></Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                )
                            }}>
                        </OutsidePopup>
                    </div>
                </div>
            </div>
        );
    }
}
