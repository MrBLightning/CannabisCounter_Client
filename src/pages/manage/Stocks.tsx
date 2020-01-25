import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { DataGrid } from 'devextreme-react';
import DataSource from 'devextreme/data/data_source';
import { FilterRow, HeaderFilter, LoadPanel, Paging, Editing, Popup, Form, Column, RequiredRule, Export, Scrolling, Texts } from 'devextreme-react/data-grid';
import { Popup as OutsidePopup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import { Item } from 'devextreme-react/form';
import { Pharmacy, Stock, Location, CannabisItem, Supplier, Category } from 'shared/interfaces/models/SystemModels';
import { getPharmacys, getLocations, getStocks, getCannabisItems, getSuppliers, addStock, updateStock, deleteStock, getCategorys } from 'shared/api/stock.provider';
import { uiNotify } from 'shared/components/Toast';
import XLSX from 'xlsx';
import { checkPageVersion } from 'shared/components/Version-control';
import { setVersionButton } from './ManagePage';
import { checkPageToeknTime } from 'shared/components/Token-time-control';
import { RbacPermission } from 'shared/store/auth/auth.types';
import { AuthUser } from 'shared/interfaces/models/User';

type StocksProps = {
    permission: RbacPermission;
    user:AuthUser;
} & RouteComponentProps;

type StocksState = {
    pharmacies: Pharmacy[],
    locations: Location[],
    items: CannabisItem[],
    categories: Category[],
    suppliers: Supplier[],
    stocks: Stock[],
    isPopupVisible: boolean,
    loading: boolean,
    userMessage: string,
}
export class Stocks extends Component<StocksProps> {
    dataGrid: any | null = null;
    state: StocksState = {
        pharmacies: [],
        locations:[],
        items:[],
        categories: [],
        suppliers: [],
        stocks: [],
        isPopupVisible: false,
        loading: true,
        userMessage: ''
    }

    reloadAllPharmacies = async (): Promise<void> => {
        try {
            const pharmacies = await getPharmacys();
            this.setState({ pharmacies });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    reloadAllLocations = async (): Promise<void> => {
        try {
            const locations = await getLocations();
            this.setState({ locations });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    reloadAllStocks = async (): Promise<void> => {
        try {
            const stocks = await getStocks();
            this.setState({ stocks });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    reloadAllItems = async (): Promise<void> => {
        try {
            const items = await getCannabisItems();
            this.setState({ items });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    reloadAllCategorys = async (): Promise<void> => {
        try {
            const categories = await getCategorys();
            this.setState({ categories });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    reloadAllSuppliers = async (): Promise<void> => {
        try {
            const suppliers = await getSuppliers();
            this.setState({ suppliers });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }


    addStock = async (PharmacyId: number, LocationId: number, CategoryId: number, SupplierId: number, InStock: number, ByUser: number): Promise<void> => {
        await addStock(PharmacyId, LocationId, CategoryId, SupplierId, InStock, ByUser);
    }

    updateStock = async (Id: number, PharmacyId: number, LocationId: number, CategoryId: number, SupplierId: number, InStock: number, ByUser: number): Promise<void> => {
        await updateStock(Id, PharmacyId, LocationId, CategoryId, SupplierId, InStock, ByUser);
    }

    deleteStock = async (Id: number): Promise<void> => {
        await deleteStock(Id);
    }

    init = async () => {
        await this.reloadAllLocations();
        await this.reloadAllPharmacies();
        // await this.reloadAllItems();
        await this.reloadAllCategorys();
        await this.reloadAllSuppliers();
        await this.reloadAllStocks();
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

    // part of the DataGrid life-cycle. Happens as soon as a line is added into the page table
    onRowInserting = (e: any) => {
        if (typeof this.state.stocks.filter(stock => (stock.PharmacyId === parseInt(e.data.PharmacyId, 10) && 
                                            stock.CategoryId === parseInt(e.data.CategoryId, 10) &&
                                            stock.SupplierId === parseInt(e.data.SupplierId, 10)))[0] !== 'undefined') {
            uiNotify('אי אפשר להוסיף את הצירוף הזה - הוא כבר קיים בטבלה', 'error');
            // cancel the event
            e.cancel = true;
        }
    }

    // part of the DataGrid life-cycle. Happens everytime a line is inserted into the page table
    onRowInserted(e: any) {
        let location = this.state.pharmacies.filter(pharmacy => pharmacy.Id === parseInt(e.PharmacyId, 10))[0].LocationId;
        this.addStock(e.PharmacyId, location, e.CategoryId, e.SupplierId, e.InStock, this.props.user.id).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
        this.setState({ loading: true })
        this.reloadAllStocks().then(() => {
            this.setState({ loading: false })
        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    // part of the DataGrid life-cycle. Happens everytime a line is updated in the page table
    onRowUpdated(e: any) {
        this.updateStock(e.Id, e.PharmacyId, e.LocationId, e.CategoryId, e.SupplierId, e.InStock, this.props.user.id).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
        this.setState({ loading: true })
        this.reloadAllStocks().then(() => {
            this.setState({ loading: false })
        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    // part of the DataGrid life-cycle. Happens everytime a line is removed in the page table
    onRowRemoved(e: any) {
        this.deleteStock(e.Id).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    onEditorPreparing = (event: any) => {
        // https://www.devexpress.com/Support/Center/Question/Details/T749901/datagrid-allow-column-editing-on-insert-but-not-on-update
        let inserting = false;
        let updating = false;
        if ((typeof (event.row) != 'undefined') && (typeof (event.row.data.Id) != 'undefined')) {
            updating = true;
        } else {
            inserting = true;
        }

        const notEditableOnUpdate: any = ['PharmacyId', 'CategoryId', 'SupplierId']; // data field names of columns not editable on update  
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
            //     location: 'after',
            //     widget: 'dxButton',
            //     options: {
            //         icon: 'refresh',
            //         onClick: this.refreshDataGrid.bind(this)
            //     }
            // },
            // {
            //     widget: 'dxButton',
            //     location: 'before',
            //     options: {
            //         text: 'טעינה מקובץ',
            //         onClick: this.showPopup.bind(this)
            //     }
            // }
        );
    }

    showPopup = () => {
        this.setState({ isPopupVisible: true, userMessage: '' });
    }

    hidePopup = () => {
        this.setState({ isPopupVisible: false, userMessage: '' });
    }


    refreshDataGrid() {
        this.dataGrid.clearFilter();
    }

    componentWillUnmount() {
        this.dataGrid = null;
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
                <div className='grid-header'>
                    <div className='container'>
                        <div className='header-text'>{"מלאי"}</div>
                    </div>
                </div> 
                <div className='grid-body'>
                    <div className='container'>
                        <DataGrid id={'gridContainer'}
                            onInitialized={(ref) => { this.dataGrid = ref.component }}
                            dataSource={new DataSource({ store: this.state.stocks, paginate: false })}
                            showColumnLines={true}
                            showRowLines={true}
                            showBorders={true}
                            rtlEnabled={true}
                            //className="grid-element"
                            width={'100%'} //Hardcoded
                            rowAlternationEnabled={true}
                            onRowInserting={(e) => this.onRowInserting(e)}
                            onRowInserted={(e) => this.onRowInserted(e.data)}
                            onRowUpdated={(e) => this.onRowUpdated(e.data)}
                            onRowRemoved={(e) => this.onRowRemoved(e.data)}
                            onEditorPreparing={this.onEditorPreparing}
                            //onToolbarPreparing={this.onToolbarPreparing}
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
                            <Export enabled={true} fileName={'stock'} />
                            <Editing
                                // mode={'row'}
                                mode={'popup'}
                                allowUpdating={this.props.permission.edit}
                                allowDeleting={this.props.permission.delete}
                                allowAdding={this.props.permission.create}
                                useIcons={true}>
                                <Texts
                                    confirmDeleteMessage="האם אתם בטוחים שברצונכם למחוק את השורה הזו?"
                                />
                                <Popup title={'מלאי'} showTitle={true} width={350} height={250}>
                                </Popup>
                                <Form>
                                    <Item itemType={'group'} >
                                        <Item dataField={'PharmacyId'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'CategoryId'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'SupplierId'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'InStock'} cssClass={'Form-item-texteditor'} />
                                    </Item>
                                </Form>
                            </Editing>

                            <Column dataField={'PharmacyId'} caption={'בית מרקחת'} lookup={{
                                dataSource: () => this.state.pharmacies,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}><RequiredRule /></Column>
                            <Column dataField={'LocationId'} caption={'מיקום'} lookup={{
                                dataSource: () => this.state.locations,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}><RequiredRule /></Column>
                            <Column dataField={'CategoryId'} caption={'מוצר'} lookup={{
                                dataSource: () => this.state.categories,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}><RequiredRule /></Column>
                            <Column dataField={'SupplierId'} caption={'יצרן'} lookup={{
                                dataSource: () => this.state.suppliers,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}><RequiredRule /></Column>
                            <Column dataField={'InStock'} caption={'כמות במלאי'} dataType={'boolean'}><RequiredRule /></Column>
                        </DataGrid>
                    </div>
                </div>
            </div>
        );
    }
}
