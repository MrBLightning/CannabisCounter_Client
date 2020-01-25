import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { DataGrid } from 'devextreme-react';
import DataSource from 'devextreme/data/data_source';
import { FilterRow, HeaderFilter, LoadPanel, Paging, Editing, Popup, Form, Column, Export, Texts } from 'devextreme-react/data-grid';
import { Popup as OutsidePopup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import { Item } from 'devextreme-react/form';
import { Sapak, CatalogItem, SingleSupplierItem } from 'shared/interfaces/models/SystemModels';
import { uiNotify } from 'shared/components/Toast';
import XLSX from 'xlsx';
import { checkPageVersion } from 'shared/components/Version-control';
import { setVersionButton } from '../ManagePage';
import { getItems, getSuppliers, getSingleSupplierItems, addSingleSupplierItem, updateSingleSupplierItem, deleteSingleSupplierItem } from 'shared/api/singleSupplierItem.provider';
import { checkPageToeknTime } from 'shared/components/Token-time-control';
import { RbacPermission } from 'shared/store/auth/auth.types';
import { placeholder, stringLiteral } from '@babel/types';
import { confirm } from 'devextreme/ui/dialog';
import Validator, {
    RequiredRule,
    NumericRule,
    RangeRule
} from 'devextreme-react/validator';

type SingleSupplierItemsProps = {
    permission: RbacPermission;
} & RouteComponentProps;
type SingleSupplierItemsState = {
    catalogs: CatalogItem[],
    suppliers: Sapak[],
    singleSupplierItems: SingleSupplierItem[],
    isPopupVisible: boolean,
    loading: boolean,
    userMessage: string,
}
export class SingleSupplierItems extends Component<SingleSupplierItemsProps> {
    dataGrid: any | null = null;
    dataLoading: boolean = false;
    state: SingleSupplierItemsState = {
        catalogs: [],
        suppliers: [],
        singleSupplierItems: [],
        isPopupVisible: false,
        loading: true,
        userMessage: ''
    }

    loadAllItems = async (): Promise<void> => {
        try {
            const catalogs = await getItems();
            this.setState({ catalogs });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllSuppliers = async (): Promise<void> => {
        try {
            const suppliers = await getSuppliers();
            this.setState({ suppliers });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    reloadAllSingleSupplierItems = async (): Promise<void> => {
        try {
            const singleSupplierItems = await getSingleSupplierItems();
            this.setState({ singleSupplierItems });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    addSingleSupplierItem = async (BarCode: number, SupplierId: number): Promise<void> => {
        await addSingleSupplierItem(BarCode, SupplierId);
    }

    updateSingleSupplierItem = async (Id: number, BarCode: number, SupplierId: number): Promise<void> => {
        await updateSingleSupplierItem(Id, BarCode, SupplierId);
    }

    deleteSingleSupplierItem = async (Id: number): Promise<void> => {
        await deleteSingleSupplierItem(Id);
    }

    init = async () => {
        await this.loadAllItems();
        await this.loadAllSuppliers();
        await this.reloadAllSingleSupplierItems();
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
        if (typeof this.state.singleSupplierItems.filter(record => record.BarCode === parseInt(e.data.BarCode, 10))[0] !== 'undefined') {
            uiNotify('אי אפשר להוסיף את הקוד הזה - הוא כבר קיים בטבלה', 'error');
            // cancel the event
            e.cancel = true;
        }
    }

    // part of the DataGrid life-cycle. Happens everytime a line is inserted into the page table
    onRowInserted(e: any) {
        this.addSingleSupplierItem(e.BarCode, e.SupplierId).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    // part of the DataGrid life-cycle. Happens everytime a line is updated in the page table
    onRowUpdated(e: any) {
        this.updateSingleSupplierItem(e.Id, e.BarCode, e.SupplierId).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    // part of the DataGrid life-cycle. Happens everytime a line is removed in the page table
    onRowRemoved(e: any) {
        this.deleteSingleSupplierItem(e.Id).then(() => {

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

        const notEditableOnUpdate: any = ['BarCode']; // data field names of columns not editable on update  
        const notEditableOnInsert: any = []; // data field names of columns not editable on insert  

        if (inserting && notEditableOnInsert.includes(event.dataField)) {
            event.editorOptions.disabled = true;
        } else if (updating && notEditableOnUpdate.includes(event.dataField)) {
            event.editorOptions.disabled = true;
        }
    }

    onToolbarPreparing = (e: any) => {
        e.toolbarOptions.items.unshift({
            location: 'before',
        }, {
            location: 'after',
            widget: 'dxButton',
            options: {
                icon: 'refresh',
                onClick: this.refreshDataGrid.bind(this)
            }
        });
        // e.toolbarOptions.items.push({
        //     widget: 'dxButton',
        //     location: 'after',
        //     options: {
        //         text: 'טעינה מקובץ',
        //         onClick: this.showPopup.bind(this)
        //     }
        // }, {
        //     widget: 'dxButton',
        //     location: 'after',
        //     options: {
        //         text: 'מחיקת החיתוך',
        //         onClick: this.deleteFiltered.bind(this)
        //     }
        // });
    }

    // deleteFiltered() {
    //     let result = confirm("<i>האם את/ה בטוח?</i>", "לבצע מחיקה");
    //     result.then((dialogResult) => {
    //         if (dialogResult) {
    //             var localGridData = new DataSource({
    //                 store: this.state.branches,
    //                 paginate: false
    //             });
    //             this.dataLoading = true;
    //             var filterExpr = this.dataGrid.getCombinedFilter();
    //             localGridData.filter(filterExpr);
    //             localGridData.load().then(filterResult => {
    //                 for (var i = 0; i < filterResult.length; i++) {
    //                     var branch: Branch = filterResult[i];
    //                     this.deleteBranch(branch.BranchId).then(() => {
    //                         this.setState({ loading: true })
    //                         this.init().then(() => {
    //                             this.setState({ loading: false })
    //                         }).catch(err => {
    //                             uiNotify(err, 'error');
    //                         })
    //                     }).catch(err => {
    //                         uiNotify(err, 'error');
    //                     });
    //                 }
    //             });
    //         }
    //     });
    // }

    showPopup() {
        this.setState({ isPopupVisible: true, userMessage: '' });
    }

    hidePopup() {
        this.setState({ isPopupVisible: false, userMessage: '' });
    }

    // loadXLSX(e: any) {
    //     let file = e.target.file.files[0];
    //     if (typeof file === 'undefined') {
    //         console.log('file empty');
    //         uiNotify('אין אפשרות להשתמש בקובץ ריק', 'error');
    //         return;
    //     }
    //     if (!file.name.endsWith(".xlsx")) {
    //         console.log('file not of type XLSX');
    //         uiNotify('- אין אפשרות להשתמש בקובץ מסוג אחר מלבד אקסל', 'error');
    //         return;
    //     }
    //     let reader = new FileReader();
    //     reader.readAsBinaryString(file);
    //     reader.onloadend = async (e: any): Promise<void> => {
    //         console.log('uploading file', e);
    //         var data = e.target.result;
    //         var workLine = await XLSX.read(data, { type: 'binary' });
    //         var fileData: any[] = await XLSX.utils.sheet_to_json(workLine.Sheets[workLine.SheetNames[0]]);
    //         console.log('working', fileData, fileData.length);
    //         var excelLine: number = 1; // Line begins at 1 but in the file it is actually 2
    //         var message = '';
    //         for (var i = 0; i < fileData.length; i++) {
    //             if (!isNaN(fileData[i].BranchId) && typeof (fileData[i].Name) != 'undefined'
    //                 // && !isNaN(fileData[i].accessCode)
    //             ) {
    //                 // check if branch id already exists in this.state.branches
    //                 let id = this.state.branches.filter(branch => branch.BranchId === fileData[i].BranchId);
    //                 if (typeof id[0] !== 'undefined') {
    //                     // branch exists - we update the name for the line and the user message about the line
    //                     message = ' שורה  ' + excelLine + ' מתוך ' + fileData.length + ' ===> מעדכן סניף ' + fileData[i].id;
    //                     console.log(message);
    //                     this.setState({ userMessage: message });
    //                     // const lastSeen: Date = new Date(Date.parse(fileData[i].lastSeen));
    //                     await this.updateBranch(fileData[i].BranchId, fileData[i].Name, 0, 0, null, null, null)
    //                         .then(() => {
    //                         }).catch(err => {
    //                             uiNotify(err, 'error');
    //                         });
    //                 } else {
    //                     // branch dosn't exist - we add line and update the user message
    //                     message = ' שורה  ' + excelLine + ' מתוך ' + fileData.length + ' ===> סניף ' + fileData[i].BranchId + ' ושם ' + fileData[i].Name + ' התווסף לטבלה';
    //                     console.log(message);
    //                     this.setState({ userMessage: message });
    //                     // const lastSeen: Date = new Date(Date.parse(fileData[i].lastSeen));
    //                     await this.addBranch(fileData[i].BranchId, fileData[i].Name, 0, 0, null, null, null)
    //                         .then(() => {
    //                         }).catch(err => {
    //                             uiNotify(err, 'error');
    //                         });
    //                 }
    //                 excelLine++;
    //             } else {
    //                 message = ' שורה  ' + excelLine + ' מתוך ' + fileData.length + ' ===> שם הסניף, מספר הסניף או קוד הגישה אינם תקינים';
    //                 console.log(message);
    //                 this.setState({ userMessage: message });
    //                 return;
    //             }
    //         }
    //         message = ' כל השורות בקובץ התעדכנו כראוי ';
    //         console.log(message);
    //         this.setState({ userMessage: message });
    //         // regradless of updates, we now need to re-load everything
    //         this.init().then(() => {
    //             this.setState({ loading: false })
    //         }).catch(err => {
    //             uiNotify(err, 'error');
    //         })
    //     }
    // }

    refreshDataGrid() {
        this.dataGrid.clearFilter();
    }

    componentWillUnmount() {
        this.dataGrid = null;
    }

    render() {
        return (
            <div className='grid-wrapper'>
                <div className='grid-body'>
                    <div className='container'>
                        <DataGrid id={'gridContainer'}
                            onInitialized={(ref) => { this.dataGrid = ref.component }}
                            dataSource={new DataSource({ store: this.state.singleSupplierItems, paginate: false })}
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

                            {/* <Scrolling mode={'virtual'}></Scrolling> */}
                            <Paging enabled={false} />
                            <Export enabled={true} fileName={'SingleSupplierItems'} />
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
                                <Popup title={'שיוך פריט לספק יחיד לחלוקה'} showTitle={true} width={350} height={170}>
                                </Popup>
                                <Form>
                                    <Item itemType={'group'} >
                                        <Item dataField={'BarCode'} cssClass={'Form-item-texteditor'}/>
                                        <Item dataField={'SupplierId'} cssClass={'Form-item-texteditor'}/>
                                    </Item>
                                </Form>
                            </Editing>

                            <Column dataField={'BarCode'} caption={'פריט'}
                                lookup={{
                                    dataSource: () => this.state.catalogs,
                                    displayExpr: "Name",
                                    valueExpr: "BarCode",
                                }}>
                                <Validator>
                                    <RequiredRule message={"חייבים למלא ערך"} />
                                </Validator>
                            </Column>
                            <Column dataField={'SupplierId'} caption={'ספק'}
                                lookup={{
                                    dataSource: () => this.state.suppliers,
                                    displayExpr: "Name",
                                    valueExpr: "Id",
                                }}>
                                <Validator>
                                    <RequiredRule message={"חייבים למלא ערך"} />
                                </Validator>
                            </Column>
                        </DataGrid>
                        {/* <OutsidePopup title={'טעינה מקובץ'} showTitle={true} width={350} height={350} visible={this.state.isPopupVisible} onHiding={() => this.hidePopup()}>
                            <div className='grid-wrapper' dir='rtl'>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    this.loadXLSX(e);
                                }}>
                                    <input type="file" id="file" name="file" style={{ width: "235px", margin: "0 0 0 10px" }} />
                                    <Button text={'בצע'} useSubmitBehavior style={{ margin: "0px 0px 3px 0px" }}></Button>
                                </form>
                                <p>
                                    <b>{this.state.userMessage}</b>
                                </p>
                            </div>
                        </OutsidePopup> */}
                    </div>
                </div>
            </div>
        );
    }
}
