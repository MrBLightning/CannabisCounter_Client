import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { DataGrid } from 'devextreme-react';
import DataSource from 'devextreme/data/data_source';
import { FilterRow, HeaderFilter, LoadPanel, Paging, Editing, Popup, Form, Column, RequiredRule, Export, Texts } from 'devextreme-react/data-grid';
import { Popup as OutsidePopup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import { Item } from 'devextreme-react/form';
import { Sapak, Branch, CodeConversion } from 'shared/interfaces/models/SystemModels';
import { getBranches, getSapakim, getCodeConversions, addCodeConversion, updateCodeConversion, deleteCodeConversion } from 'shared/api/codeconversion.provider';
import { uiNotify } from 'shared/components/Toast';
import XLSX from 'xlsx';
import { checkPageVersion } from 'shared/components/Version-control';
import { setVersionButton } from '../ManagePage';
import { checkPageToeknTime } from 'shared/components/Token-time-control';
import { RbacPermission } from 'shared/store/auth/auth.types';

type SapakimProps = {
    permission: RbacPermission;
} & RouteComponentProps;
type CodeConversionsState = {
    branches: Branch[],
    sapakim: Sapak[],
    codeConversions: CodeConversion[],
    userMessage: string,
    isPopupVisible: boolean,
    loading: boolean
}
export class CodeConversions extends Component<SapakimProps> {
    dataGrid: any | null = null;
    state: CodeConversionsState = {
        branches: [],
        sapakim: [],
        codeConversions: [],
        userMessage: '',
        isPopupVisible: false,
        loading: true,
    }

    // function for reloading all sapakim
    loadAllSapakim = async (): Promise<void> => {
        // get all the lines in table 'sapakim' from the node server
        try {
            const sapakim = await getSapakim();
            this.setState({ sapakim });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    // function for reloading all branches
    loadAllBranches = async (): Promise<void> => {
        // get all the lines in table 'branches' from the node server
        try {
            const branches = await getBranches();
            this.setState({ branches });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    // function for reloading all branches
    reloadAllCodeConversions = async (): Promise<void> => {
        // get all the lines in table 'branches' from the node server
        try {
            const codeConversions = await getCodeConversions();
            let SapakId: number = 0;
            let BranchId: number = 0;
            for (let i = 0; i < codeConversions.length; i++) {
                codeConversions[i].SapakName = codeConversions[i].Sapak;
                codeConversions[i].BranchName = codeConversions[i].Branch;
            }
            this.setState({ codeConversions });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    // function for adding a sapakim
    addCodeConversion = async (Code: number, Branch: number, Sapak: number): Promise<void> => {
        await addCodeConversion(Code, Branch, Sapak);
    }

    // function for updating a sapakim
    updateCodeConversion = async (Code: number, Branch: number, Sapak: number): Promise<void> => {
        await updateCodeConversion(Code, Branch, Sapak);
    }

    // function for deleting a sapakim
    deleteCodeConversion = async (Code: number): Promise<void> => {
        await deleteCodeConversion(Code);
    }

    init = async () => {
        await this.loadAllSapakim();
        await this.loadAllBranches();
        await this.reloadAllCodeConversions();
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
        if (typeof this.state.codeConversions.filter(codeCon => codeCon.Code === parseInt(e.data.Code, 10))[0] !== 'undefined') {
            // alert('You cannot add this branch code - it already exists in the table');
            uiNotify('אי אפשר להוסיף את הקוד הזה - הוא כבר קיים בטבלה', 'error');
            // cancel the event
            e.cancel = true;
        }
        e.Branch = e.BranchName;
        e.Sapak = e.SapakName;
    }

    // part of the DataGrid life-cycle. Happens everytime a line is inserted into the page table
    onRowInserted = async (e: any) => {
        e.Branch = e.BranchName;
        e.Sapak = e.SapakName;
        this.addCodeConversion(e.Code, e.BranchName, e.SapakName).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
        // update the page to reflect the new branch/supplier codes
        await this.reloadAllCodeConversions();
    }

    // part of the DataGrid life-cycle. Happens everytime a line is updateing in the page table
    onRowUpdating(e: any) {
        e.Branch = e.BranchName;
        e.Sapak = e.SapakName;
    }

    // part of the DataGrid life-cycle. Happens everytime a line is updated in the page table
    onRowUpdated = async (e: any) => {
        e.Branch = e.BranchName;
        e.Sapak = e.SapakName;
        this.updateCodeConversion(e.Code, e.BranchName, e.SapakName).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
        // update the page to reflect the new branch/supplier codes
        await this.reloadAllCodeConversions();
    }

    // part of the DataGrid life-cycle. Happens everytime a line is removed in the page table
    onRowRemoved(e: any) {
        this.deleteCodeConversion(e.Code).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    onEditorPreparing = (event: any) => {
        // https://www.devexpress.com/Support/Center/Question/Details/T749901/datagrid-allow-column-editing-on-insert-but-not-on-update
        let inserting = false;
        let updating = false;
        if ((typeof (event.row) != 'undefined') && (typeof (event.row.data.Code) != 'undefined')) {
            updating = true;
        } else {
            inserting = true;
        }

        const notEditableOnUpdate: any = ['Code']; // data field names of columns not editable on update  
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
            {
                widget: 'dxButton',
                location: 'before',
                options: {
                    text: 'טעינה מקובץ',
                    onClick: this.showPopup.bind(this)
                }
            }
        );
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
    //             if (!isNaN(fileData[i].Id) && typeof (fileData[i].Name) != 'undefined') {
    //                 if (typeof this.state.sapakim.filter(sapak => sapak.Id === fileData[i].Id)[0] !== 'undefined') {
    //                     message = ' שורה  ' + excelLine + ' מתוך ' + fileData.length + ' ===> מעדכן ספק ' + fileData[i].Id;
    //                     console.log(message);
    //                     this.setState({ userMessage: message });
    //                     await this.updateSapak(fileData[i].Id, fileData[i].Name)
    //                         .then(() => {
    //                         }).catch(err => {
    //                             uiNotify(err, 'error');
    //                         });
    //                 } else {
    //                     message = ' שורה  ' + excelLine + ' מתוך ' + fileData.length + ' ===> ספק ' + fileData[i].Id + ' ושם ' + fileData[i].Name + ' התווסף לטבלה';
    //                     console.log(message);
    //                     this.setState({ userMessage: message });
    //                     await this.addSapak(fileData[i].Id, fileData[i].Name)
    //                         .then(() => {
    //                         }).catch(err => {
    //                             uiNotify(err, 'error');
    //                         });
    //                 }
    //                 excelLine++;
    //             } else {
    //                 message = ' שורה  ' + excelLine + ' מתוך ' + fileData.length + ' ===> שם ספק או מספר ספק אינם תקינים';
    //                 console.log(message);
    //                 this.setState({ userMessage: message });
    //                 return;
    //             }
    //         }
    //         message = ' כל השורות בקובץ התעדכנו כראוי ';
    //         console.log(message);
    //         this.setState({ userMessage: message });
    //         // regradless of updates, we now need to re-load everything
    //         this.reloadAllSapakim().then(() => {
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
        if (this.state.loading)
            return (
                <div className="app-loader">
                    <div className="loader" />
                </div>
            );

        return (
            <div className='grid-wrapper'>
                {/* <div className='grid-header'>
                    <div className='container'>
                        <div className='header-text'>{"ספקים"}</div>
                    </div>
                </div> */}
                <div className='grid-body'>
                    <div className='container'>
                        <DataGrid id={'gridContainer'}
                            onInitialized={(ref) => { this.dataGrid = ref.component }}
                            dataSource={new DataSource({ store: this.state.codeConversions, paginate: false })}
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

                            {/* <Scrolling mode={'virtual'}></Scrolling> */}
                            <Paging enabled={false} />
                            <Export enabled={true} fileName={'sapakim'} />
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
                                <Popup title={'המרת חשבונות'} showTitle={true} width={380} height={200}>
                                </Popup>
                                <Form>
                                    <Item itemType={'group'} >
                                        <Item dataField={'SapakName'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'BranchName'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'Code'} cssClass={'Form-item-texteditor'} />
                                    </Item>
                                </Form>
                            </Editing>

                            <Column key='b_sapak' dataField={'Sapak'} caption={'קוד ספק'} max-width={200}><RequiredRule /></Column>,
                            <Column key='b_sapakName' dataField={'SapakName'} caption={'שם ספק'} max-width={200} lookup={{
                                dataSource: () => this.state.sapakim,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}><RequiredRule /></Column>,
                            <Column key='b_branch' dataField={'Branch'} caption={'קוד סניף'} max-width={200}><RequiredRule /></Column>,
                            <Column key='b_branchName' dataField={'BranchName'} caption={'שם סניף'} max-width={200} lookup={{
                                dataSource: () => this.state.branches,
                                displayExpr: "Name",
                                valueExpr: "BranchId"
                            }}><RequiredRule /></Column>,
                            <Column key='b_code' dataField={'Code'} caption={'קוד סניף לספק'} max-width={200}><RequiredRule /></Column>
                        </DataGrid>
                        {/* <OutsidePopup title={'טעינה מקובץ'} showTitle={true} width={350} height={250} visible={this.state.isPopupVisible} onHiding={() => this.hidePopup()}>
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
