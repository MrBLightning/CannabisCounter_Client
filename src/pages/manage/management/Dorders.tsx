import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { DataGrid } from 'devextreme-react';
import DataSource from 'devextreme/data/data_source';
import { FilterRow, HeaderFilter, LoadPanel, Paging, Editing, Popup, Form, Column, RequiredRule, Export, Texts } from 'devextreme-react/data-grid';
import { Popup as OutsidePopup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import { Item } from 'devextreme-react/form';
import { CatalogItem, Branch, Dorder, DorderName } from 'shared/interfaces/models/SystemModels';
import { uiNotify } from 'shared/components/Toast';
import XLSX from 'xlsx';
import { checkPageVersion } from 'shared/components/Version-control';
import { setVersionButton } from '../ManagePage';
import { getItems, getBranches, getDorders, addDorder, updateDorder, deleteDorder } from 'shared/api/dorders.provider';
import { checkPageToeknTime } from 'shared/components/Token-time-control';
import { RbacPermission } from 'shared/store/auth/auth.types';
import { placeholder, stringLiteral } from '@babel/types';
import { confirm } from 'devextreme/ui/dialog';

type DordersProps = {
    permission: RbacPermission;
} & RouteComponentProps;
type DordersState = {
    catalogItems: CatalogItem[],
    branches: Branch[],
    dorders: Dorder[],
    dorderNames: DorderName[],
    isPopupVisible: boolean,
    loading: boolean,
    userMessage: string,
}
export class Dorders extends Component<DordersProps> {
    dataGrid: any | null = null;
    dataLoading: boolean = false;
    state: DordersState = {
        catalogItems: [],
        branches: [],
        dorders: [],
        dorderNames: [],
        isPopupVisible: false,
        loading: true,
        userMessage: ''
    }

    loadAllCatalogItems = async (): Promise<void> => {
        try {
            const catalogItems = await getItems();
            this.setState({ catalogItems });
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

    reloadAllDorders = async (): Promise<void> => {
        try {
            const dorders = await getDorders();
            this.setState({ dorders });
            const dorderNames = [];
            this.setState({ dorderNames: [] });
            let length = dorders.length;
            for (let i = 0; i < length; i++) {
                let dorderName = {
                    Id: dorders[i].Id,
                    BranchId: dorders[i].BranchId,
                    BranchName: dorders[i].BranchId,
                    BarCode: dorders[i].BarCode,
                    BarCodeName: dorders[i].BarCode,
                    d1: dorders[i].d1,
                    d2: dorders[i].d2,
                    d3: dorders[i].d3,
                    d4: dorders[i].d4,
                    d5: dorders[i].d5,
                    d6: dorders[i].d6,
                    d7: dorders[i].d7
                }
                dorderNames.push(dorderName);
            }
            this.setState({ dorderNames });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    addDorder = async (BranchId: number, BarCode: number, d1: number | null, d2: number | null,
        d3: number | null, d4: number | null, d5: number | null, d6: number | null, d7: number | null): Promise<void> => {
        await addDorder(BranchId, BarCode, d1, d2, d3, d4, d5, d6, d7);
    }

    updateDorder = async (Id: number, BranchId: number, BarCode: number, d1: number | null, d2: number | null,
        d3: number | null, d4: number | null, d5: number | null, d6: number | null, d7: number | null): Promise<void> => {
        await updateDorder(Id, BranchId, BarCode, d1, d2, d3, d4, d5, d6, d7);
    }

    deleteDorder = async (Id: number): Promise<void> => {
        await deleteDorder(Id);
    }

    init = async () => {
        await this.loadAllCatalogItems();
        await this.loadAllBranches();
        await this.reloadAllDorders();
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
        if (typeof this.state.dorderNames.filter(dorderName => dorderName.BranchId === parseInt(e.data.BranchName, 10)
            && dorderName.BarCode === parseInt(e.data.BarCodeName, 10))[0] !== 'undefined') {
            uiNotify('-   אי אפשר להוסיף את הצירוף הזה - הוא כבר קיים בטבלה', 'error');
            // cancel the event
            e.cancel = true;
        }
    }

    // part of the DataGrid life-cycle. Happens everytime a line is inserted into the page table
    onRowInserted(e: any) {
        this.addDorder(e.BranchName, e.BarCodeName, e.d1, e.d2, e.d3, e.d4, e.d5, e.d6, e.d7).then(() => {
            // update the page to reflect the new peruk code
            this.reloadAllDorders();
        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    onRowUpdating(e: any) {
        let BranchId = parseInt(e.oldData.BranchName, 10);
        let BarCode = parseInt(e.oldData.BarCodeName, 10);
        if (typeof e.newData.BranchId != 'undefined') {
            BranchId = e.newData.BranchName;
        }
        if (typeof e.newData.BarCodeName != 'undefined') {
            BarCode = e.newData.BarCodeName;
        }
        if (BranchId === 0 || BarCode === 0) {
            uiNotify('-   השדה לא יכול להיות ריק', 'error');
            // cancel the event
            e.cancel = true;
        } 
    }

    // part of the DataGrid life-cycle. Happens everytime a line is updated in the page table
    onRowUpdated(e: any) {
        this.updateDorder(e.Id, e.BranchName, e.BarCodeName, e.d1, e.d2, e.d3, e.d4, e.d5, e.d6, e.d7).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    // part of the DataGrid life-cycle. Happens everytime a line is removed in the page table
    onRowRemoved(e: any) {
        this.deleteDorder(e.Id).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
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
        e.toolbarOptions.items.push({
            widget: 'dxButton',
            location: 'after',
            options: {
                text: 'טעינה מקובץ',
                onClick: this.showPopup.bind(this)
            }
        });
    }

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
                {/* <div className='grid-header'>
                    <div className='container'>
                        <div className='header-text'>{"המלצה לסניף"}</div>
                    </div>
                </div> */}
                <div className='grid-body'>
                    <div className='container'>
                        <DataGrid id={'gridContainer'}
                            onInitialized={(ref) => { this.dataGrid = ref.component }}
                            dataSource={new DataSource({ store: this.state.dorderNames, paginate: false })}
                            showColumnLines={true}
                            showRowLines={true}
                            showBorders={true}
                            rtlEnabled={true}
                            className="grid-element"
                            width={'100%'} //Hardcoded
                            rowAlternationEnabled={true}
                            onRowInserting={(e) => this.onRowInserting(e)}
                            onRowInserted={(e) => this.onRowInserted(e.data)}
                            onRowUpdating={(e) => this.onRowUpdating(e)}
                            onRowUpdated={(e) => this.onRowUpdated(e.data)}
                            onRowRemoved={(e) => this.onRowRemoved(e.data)}
                        // onEditorPreparing={this.onEditorPreparing}
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
                            <Export enabled={true} fileName={'dorders'} />
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
                                <Popup title={'עדכון המלצה לסניף'} showTitle={true} width={350} height={600}>
                                </Popup>
                                <Form>
                                    <Item itemType={'group'} >
                                        <Item dataField={'BranchName'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'BarCodeName'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'d1'} />
                                        <Item dataField={'d2'} />
                                        <Item dataField={'d3'} />
                                        <Item dataField={'d4'} />
                                        <Item dataField={'d5'} />
                                        <Item dataField={'d6'} />
                                        <Item dataField={'d7'} />
                                    </Item>
                                </Form>
                            </Editing>

                            <Column dataField={'BranchId'} caption={'קוד סניף'} width={85}></Column>
                            <Column dataField={'BranchName'} caption={'שם סניף'}
                                lookup={{
                                    dataSource: () => this.state.branches,
                                    displayExpr: "Name",
                                    valueExpr: "BranchId",
                                }}><RequiredRule /></Column>
                            <Column dataField={'BarCode'} caption={'קוד פריט'}></Column>
                            <Column dataField={'BarCodeName'} caption={'שם פריט'}
                                lookup={{
                                    dataSource: () => this.state.catalogItems,
                                    displayExpr: "Name",
                                    valueExpr: "BarCode",
                                }}><RequiredRule /></Column>
                            <Column dataField={'d1'} caption={'יום א'} dataType={'number'} width={65}></Column>
                            <Column dataField={'d2'} caption={'יום ב'} dataType={'number'} width={65}></Column>
                            <Column dataField={'d3'} caption={'יום ג'} dataType={'number'} width={65}></Column>
                            <Column dataField={'d4'} caption={'יום ד'} dataType={'number'} width={65}></Column>
                            <Column dataField={'d5'} caption={'יום ה'} dataType={'number'} width={65}></Column>
                            <Column dataField={'d6'} caption={'יום ו'} dataType={'number'} width={65}></Column>
                            <Column dataField={'d7'} caption={'יום ש'} dataType={'number'} width={65}></Column>
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
