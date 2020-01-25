import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { DataGrid } from 'devextreme-react';
import DataSource from 'devextreme/data/data_source';
import { FilterRow, HeaderFilter, LoadPanel, Paging, Editing, Popup, Form, Column, RequiredRule, Export, Scrolling } from 'devextreme-react/data-grid';
import { Popup as OutsidePopup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import { Item } from 'devextreme-react/form';
import { CatalogItem, Subbar } from 'shared/interfaces/models/SystemModels';
import { getCatalogItems, getSubbars, addSubbar, updateSubbar, deleteSubbar } from 'shared/api/subbargeneral.provider';
import { uiNotify } from 'shared/components/Toast';
import XLSX from 'xlsx';
import { checkPageVersion } from 'shared/components/Version-control';
import { setVersionButton } from '../ManagePage';
import { checkPageToeknTime } from 'shared/components/Token-time-control';
import { RbacPermission } from 'shared/store/auth/auth.types';


type SubbarGeneralsProps = {
    permission: RbacPermission;
} & RouteComponentProps;

type SubbarGeneralsState = {
    subbars: Subbar[],
    catalogs: CatalogItem[],
    isPopupVisible: boolean,
    loading: boolean,
    userMessage: string,
}
export class SubbarGenerals extends Component<SubbarGeneralsProps> {
    dataGrid: any | null = null;
    state: SubbarGeneralsState = {
        subbars: [],
        catalogs: [],
        isPopupVisible: false,
        loading: true,
        userMessage: ''
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

    reloadAllSubbars = async (): Promise<void> => {
        try {
            const subbars = await getSubbars();
            this.setState({ subbars });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    addSubbar = async (Name: string, br1: number, br2: number, br3: number, br4: number,
        br5: number, br6: number, br7: number, br8: number, br9: number, br10: number): Promise<void> => {
        await addSubbar(Name, br1, br2, br3, br4, br5, br6, br7, br8, br9, br10);
    }

    updateSubbar = async (Id: number, Name: string, br1: number, br2: number, br3: number, br4: number,
        br5: number, br6: number, br7: number, br8: number, br9: number, br10: number): Promise<void> => {
        await updateSubbar(Id, Name, br1, br2, br3, br4, br5, br6, br7, br8, br9, br10);
    }

    deleteSubbar = async (Id: number): Promise<void> => {
        await deleteSubbar(Id);
    }

    componentDidMount() {
        // check page version
        checkPageVersion();
        // check token expDate
        checkPageToeknTime();

        this.setState({ loading: true })
        this.reloadAllSubbars().then(() => {
            this.setState({ loading: false })
        }).catch(err => {
            uiNotify(err, 'error');
        })
    };

    // part of the DataGrid life-cycle. Happens as soon as a line is added into the page table
    onRowInserting = (e: any) => {
        if (typeof this.state.subbars.filter(subbar => subbar.Name === e.data.Name)[0] !== 'undefined') {
            uiNotify('אי אפשר להוסיף את השם הזה - הוא כבר קיים בטבלה', 'error');
            // cancel the event
            e.cancel = true;
        }
    }

    // part of the DataGrid life-cycle. Happens everytime a line is inserted into the page table
    onRowInserted(e: any) {
        this.addSubbar(e.Name, e.br1, e.br2, e.br3, e.br4, e.br5, e.br6, e.br7, e.br8, e.br9, e.br10).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    // part of the DataGrid life-cycle. Happens everytime a line is updated in the page table
    onRowUpdated(e: any) {
        // update row with e.id's name to e.Name in table 'classes'
        this.updateSubbar(e.Id, e.Name, e.br1, e.br2, e.br3, e.br4, e.br5, e.br6, e.br7, e.br8, e.br9, e.br10).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    // part of the DataGrid life-cycle. Happens everytime a line is removed in the page table
    onRowRemoved(e: any) {
        this.deleteSubbar(e.Id).then(() => {

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

        const notEditableOnUpdate: any = ['Name']; // data field names of columns not editable on update  
        const notEditableOnInsert: any = []; // data field names of columns not editable on insert  

        if (inserting && notEditableOnInsert.includes(event.dataField)) {
            event.editorOptions.disabled = true;
        } else if (updating && notEditableOnUpdate.includes(event.dataField)) {
            event.editorOptions.disabled = true;
        }
    }

    refreshDataGrid() {
        this.dataGrid.clearFilter();
    }

    componentWillUnmount() {
        this.dataGrid = null;
    }

    render() {
        return (
            <div className='grid-wrapper'>
                {/* <div className='grid-header'>
                    <div className='container-wide'>
                        <div className='header-text'>{"תחליפים"}</div>
                    </div>
                </div> */}
                <div className='grid-body'>
                    <div className='container-wide'>
                        <DataGrid id={'gridContainer'}
                            onInitialized={(ref) => { this.dataGrid = ref.component }}
                            dataSource={new DataSource({ store: this.state.subbars, paginate: false })}
                            showColumnLines={true}
                            showRowLines={true}
                            showBorders={true}
                            rtlEnabled={true}
                            className="grid-element"
                            width={'100%'} //Hardcoded
                            rowAlternationEnabled={true}
                            onRowInserting={(e) => this.onRowInserting(e)}
                            onRowInserted={(e) => this.onRowInserted(e.data)}
                            onRowUpdated={(e) => this.onRowUpdated(e.data)}
                            onRowRemoved={(e) => this.onRowRemoved(e.data)}
                            onEditorPreparing={this.onEditorPreparing}
                        // onToolbarPreparing={this.onToolbarPreparing}
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
                            <Export enabled={true} fileName={'subbars'} />
                            <Editing
                                // mode={'row'}
                                mode={'popup'}
                                allowUpdating={this.props.permission.edit}
                                allowDeleting={this.props.permission.delete}
                                allowAdding={this.props.permission.create}
                                useIcons={true}>
                                <Popup title={'תחליפים'} showTitle={true} width={650} height={440}>
                                </Popup>
                                <Form>
                                    <Item itemType={'group'} colCount={2}>
                                        <Item dataField={'Name'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'br1'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'br2'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'br3'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'br4'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'br5'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'br6'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'br7'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'br8'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'br9'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'br10'} cssClass={'Form-item-texteditor'} />
                                    </Item>
                                </Form>
                            </Editing>

                            <Column dataField={'Name'} caption={'שם מוצר'} width={200}><RequiredRule /></Column>
                            <Column dataField={'br1'} caption={'ברקוד'}><RequiredRule /></Column>
                            <Column dataField={'br2'} caption={'ברקוד'}><RequiredRule /></Column>
                            <Column dataField={'br3'} caption={'ברקוד'}></Column>
                            <Column dataField={'br4'} caption={'ברקוד'}></Column>
                            <Column dataField={'br5'} caption={'ברקוד'}></Column>
                            <Column dataField={'br6'} caption={'ברקוד'}></Column>
                            <Column dataField={'br7'} caption={'ברקוד'}></Column>
                            <Column dataField={'br8'} caption={'ברקוד'}></Column>
                            <Column dataField={'br9'} caption={'ברקוד'}></Column>
                            <Column dataField={'br10'} caption={'ברקוד'}></Column>
                        </DataGrid>
                    </div>
                </div>
            </div>
        );
    }
}
