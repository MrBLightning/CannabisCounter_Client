import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { DataGrid } from 'devextreme-react';
import DataSource from 'devextreme/data/data_source';
import { FilterRow, HeaderFilter, LoadPanel, Paging, Editing, Popup, Form, Column, RequiredRule, Export, Texts } from 'devextreme-react/data-grid';
import { Popup as OutsidePopup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import { Item } from 'devextreme-react/form';
import { UnitSize } from 'shared/interfaces/models/SystemModels';
import { uiNotify } from 'shared/components/Toast';
import XLSX from 'xlsx';
import { checkPageVersion } from 'shared/components/Version-control';
import { setVersionButton } from '../ManagePage';
import { getUnitSizes, addUnitSize, updateUnitSize, deleteUnitSize } from 'shared/api/unitSize.provider';
import { checkPageToeknTime } from 'shared/components/Token-time-control';
import { RbacPermission } from 'shared/store/auth/auth.types';
import { placeholder, stringLiteral } from '@babel/types';
import { confirm } from 'devextreme/ui/dialog';

type UnitSizesProps = {
    permission: RbacPermission;
} & RouteComponentProps;
type UnitSizesState = {
    units: UnitSize[],
    isPopupVisible: boolean,
    loading: boolean,
    userMessage: string,
}
export class UnitSizes extends Component<UnitSizesProps> {
    dataGrid: any | null = null;
    dataLoading: boolean = false;
    state: UnitSizesState = {
        units: [],
        isPopupVisible: false,
        loading: true,
        userMessage: ''
    }

    // get all the lines in table 'UnitSize' from the node server
    reloadAllUnitSizes = async (): Promise<void> => {
        try {
            const units = await getUnitSizes();
            this.setState({ units });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    // function for adding a UnitSize
    addUnitSize = async (Id: number, Name: string): Promise<void> => {
        await addUnitSize(Id, Name);
    }

    // function for updating a UnitSize
    updateUnitSize = async (Id: number, Name: string): Promise<void> => {
        await updateUnitSize(Id, Name);
    }

    // function for deleting a UnitSize
    deleteUnitSize = async (Id: number): Promise<void> => {
        await deleteUnitSize(Id);
    }

    init = async () => {
        await this.reloadAllUnitSizes();
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
        if (typeof this.state.units.filter(unit => unit.Id === parseInt(e.data.Id, 10))[0] !== 'undefined') {
            uiNotify('אי אפשר להוסיף את הקוד הזה - הוא כבר קיים בטבלה', 'error');
            // cancel the event
            e.cancel = true;
        }
    }

    // part of the DataGrid life-cycle. Happens everytime a line is inserted into the page table
    onRowInserted(e: any) {
        this.addUnitSize(e.Id, e.Name).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    // part of the DataGrid life-cycle. Happens everytime a line is updated in the page table
    onRowUpdated(e: any) {
        this.updateUnitSize(e.Id, e.Name).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    // part of the DataGrid life-cycle. Happens everytime a line is removed in the page table
    onRowRemoved(e: any) {
        this.deleteUnitSize(e.Id).then(() => {

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

        const notEditableOnUpdate: any = ['Id']; // data field names of columns not editable on update  
        const notEditableOnInsert: any = []; // data field names of columns not editable on insert  

        if (inserting && notEditableOnInsert.includes(event.dataField)) {
            event.editorOptions.disabled = true;
        } else if (updating && notEditableOnUpdate.includes(event.dataField)) {
            event.editorOptions.disabled = true;
        }
    }

    // onToolbarPreparing = (e: any) => {
    //     e.toolbarOptions.items.unshift({
    //         location: 'before',
    //     }, {
    //         location: 'after',
    //         widget: 'dxButton',
    //         options: {
    //             icon: 'refresh',
    //             onClick: this.refreshDataGrid.bind(this)
    //         }
    //     });
    //     e.toolbarOptions.items.push({
    //         widget: 'dxButton',
    //         location: 'after',
    //         options: {
    //             text: 'טעינה מקובץ',
    //             onClick: this.showPopup.bind(this)
    //         }
    //     }, {
    //         widget: 'dxButton',
    //         location: 'after',
    //         options: {
    //             text: 'מחיקת החיתוך',
    //             onClick: this.deleteFiltered.bind(this)
    //         }
    //     });
    // }

    // deleteFiltered() {
    //     let result = confirm("<i>האם את/ה בטוח?</i>", "לבצע מחיקה");
    //     result.then((dialogResult) => {
    //         if (dialogResult) {
    //             var localGridData = new DataSource({
    //                 store: this.state.networks,
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
                            dataSource={new DataSource({ store: this.state.units, paginate: false })}
                            showColumnLines={true}
                            showRowLines={true}
                            showBorders={true}
                            rtlEnabled={true}
                            // className="grid-element"
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
                            <Export enabled={true} fileName={'unitSizes'} />
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
                                <Popup title={'רשתות'} showTitle={true} width={350} height={180}>
                                </Popup>
                                <Form>
                                    <Item itemType={'group'} >
                                        <Item dataField={'Id'} />
                                        <Item dataField={'Name'} cssClass={'Form-item-texteditor'}/>
                                    </Item>
                                </Form>
                            </Editing>

                            <Column dataField={'Id'} caption={'קוד יחידה'}><RequiredRule /></Column>
                            <Column dataField={'Name'} caption={'שם יחידה'}><RequiredRule /></Column>
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
