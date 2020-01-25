import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { DataGrid } from 'devextreme-react';
import DataSource from 'devextreme/data/data_source';
import { FilterRow, HeaderFilter, LoadPanel, Paging, Editing, Popup, Form, Column, RequiredRule, Export, Texts } from 'devextreme-react/data-grid';
import { Popup as OutsidePopup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import { Item } from 'devextreme-react/form';
import { Branch, BranchType, BranchNetwork } from 'shared/interfaces/models/SystemModels';
import { uiNotify } from 'shared/components/Toast';
import XLSX from 'xlsx';
import { checkPageVersion } from 'shared/components/Version-control';
import { setVersionButton } from '../ManagePage';
import { getBranchTypes, getBranchNetworks, getBranches, addBranch, updateBranch, deleteBranch } from 'shared/api/branch.provider';
import { checkPageToeknTime } from 'shared/components/Token-time-control';
import { RbacPermission } from 'shared/store/auth/auth.types';
import { placeholder, stringLiteral } from '@babel/types';
import { confirm } from 'devextreme/ui/dialog';

type BranchesProps = {
    permission: RbacPermission;
} & RouteComponentProps;
type BranchesState = {
    branchTypes: BranchType[],
    networks:BranchNetwork[],
    branches: Branch[],
    isPopupVisible: boolean,
    loading: boolean,
    userMessage: string,
}
export class Branches extends Component<BranchesProps> {
    dataGrid: any | null = null;
    dataLoading: boolean = false;
    state: BranchesState = {
        branchTypes: [],
        networks:[],
        branches: [],
        isPopupVisible: false,
        loading: true,
        userMessage: ''
    }

    // get all the lines in table 'branches' from the node server
    reloadAllBranches = async (): Promise<void> => {
        try {
            const branches = await getBranches();
            this.setState({ branches });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllBranchTypes = async (): Promise<void> => {
        try {
            const branchTypes = await getBranchTypes();
            this.setState({ branchTypes });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    loadAllBranchNetworks = async (): Promise<void> => {
        try {
            const networks = await getBranchNetworks();
            this.setState({ networks });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    // function for adding a branches
    addBranch = async (BranchId: number, Name: string, BranchType: number, Percent: number,
        Weeks: number | null, TotMax: number | null, TotWeight: number | null): Promise<void> => {
        await addBranch(BranchId, Name, BranchType, Percent, Weeks, TotMax, TotWeight);
    }

    // function for updating a branches
    updateBranch = async (BranchId: number, Name: string, BranchType: number, Percent: number,
        Weeks: number | null, TotMax: number | null, TotWeight: number | null): Promise<void> => {
        await updateBranch(BranchId, Name, BranchType, Percent, Weeks, TotMax, TotWeight);
    }

    // function for deleting a branches
    deleteBranch = async (BranchId: number): Promise<void> => {
        await deleteBranch(BranchId);
    }

    init = async () => {
        await this.loadAllBranchTypes();
        await this.loadAllBranchNetworks();
        await this.reloadAllBranches();
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
        if (typeof this.state.branches.filter(branch => branch.BranchId === parseInt(e.data.BranchId, 10))[0] !== 'undefined') {
            uiNotify('אי אפשר להוסיף את הקוד הזה - הוא כבר קיים בטבלה', 'error');
            // cancel the event
            e.cancel = true;
        }
    }

    // part of the DataGrid life-cycle. Happens everytime a line is inserted into the page table
    onRowInserted(e: any) {
        this.addBranch(e.BranchId, e.Name, e.BranchType, e.Percent, e.Weeks, e.TotMax, e.TotWeight).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    // part of the DataGrid life-cycle. Happens everytime a line is updated in the page table
    onRowUpdated(e: any) {
        this.updateBranch(e.BranchId, e.Name, e.BranchType, e.Percent, e.Weeks, e.TotMax, e.TotWeight).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
    }

    // part of the DataGrid life-cycle. Happens everytime a line is removed in the page table
    onRowRemoved(e: any) {
        this.deleteBranch(e.BranchId).then(() => {

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

        const notEditableOnUpdate: any = ['BranchId']; // data field names of columns not editable on update  
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
        e.toolbarOptions.items.push({
            widget: 'dxButton',
            location: 'after',
            options: {
                text: 'טעינה מקובץ',
                onClick: this.showPopup.bind(this)
            }
        }, {
            widget: 'dxButton',
            location: 'after',
            options: {
                text: 'מחיקת החיתוך',
                onClick: this.deleteFiltered.bind(this)
            }
        });
    }

    deleteFiltered() {
        let result = confirm("<i>האם את/ה בטוח?</i>", "לבצע מחיקה");
        result.then((dialogResult) => {
            if (dialogResult) {
                var localGridData = new DataSource({
                    store: this.state.branches,
                    paginate: false
                });
                this.dataLoading = true;
                var filterExpr = this.dataGrid.getCombinedFilter();
                localGridData.filter(filterExpr);
                localGridData.load().then(filterResult => {
                    for (var i = 0; i < filterResult.length; i++) {
                        var branch: Branch = filterResult[i];
                        this.deleteBranch(branch.BranchId).then(() => {
                            this.setState({ loading: true })
                            this.init().then(() => {
                                this.setState({ loading: false })
                            }).catch(err => {
                                uiNotify(err, 'error');
                            })
                        }).catch(err => {
                            uiNotify(err, 'error');
                        });
                    }
                });
            }
        });
    }

    showPopup() {
        this.setState({ isPopupVisible: true, userMessage: '' });
    }

    hidePopup() {
        this.setState({ isPopupVisible: false, userMessage: '' });
    }

    loadXLSX(e: any) {
        let file = e.target.file.files[0];
        if (typeof file === 'undefined') {
            console.log('file empty');
            uiNotify('אין אפשרות להשתמש בקובץ ריק', 'error');
            return;
        }
        if (!file.name.endsWith(".xlsx")) {
            console.log('file not of type XLSX');
            uiNotify('- אין אפשרות להשתמש בקובץ מסוג אחר מלבד אקסל', 'error');
            return;
        }
        let reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onloadend = async (e: any): Promise<void> => {
            console.log('uploading file', e);
            var data = e.target.result;
            var workLine = await XLSX.read(data, { type: 'binary' });
            var fileData: any[] = await XLSX.utils.sheet_to_json(workLine.Sheets[workLine.SheetNames[0]]);
            console.log('working', fileData, fileData.length);
            var excelLine: number = 1; // Line begins at 1 but in the file it is actually 2
            var message = '';
            for (var i = 0; i < fileData.length; i++) {
                if (!isNaN(fileData[i].BranchId) && typeof (fileData[i].Name) != 'undefined'
                    // && !isNaN(fileData[i].accessCode)
                ) {
                    // check if branch id already exists in this.state.branches
                    let id = this.state.branches.filter(branch => branch.BranchId === fileData[i].BranchId);
                    if (typeof id[0] !== 'undefined') {
                        // branch exists - we update the name for the line and the user message about the line
                        message = ' שורה  ' + excelLine + ' מתוך ' + fileData.length + ' ===> מעדכן סניף ' + fileData[i].id;
                        console.log(message);
                        this.setState({ userMessage: message });
                        // const lastSeen: Date = new Date(Date.parse(fileData[i].lastSeen));
                        await this.updateBranch(fileData[i].BranchId, fileData[i].Name, 0, 0, null, null, null)
                            .then(() => {
                            }).catch(err => {
                                uiNotify(err, 'error');
                            });
                    } else {
                        // branch dosn't exist - we add line and update the user message
                        message = ' שורה  ' + excelLine + ' מתוך ' + fileData.length + ' ===> סניף ' + fileData[i].BranchId + ' ושם ' + fileData[i].Name + ' התווסף לטבלה';
                        console.log(message);
                        this.setState({ userMessage: message });
                        // const lastSeen: Date = new Date(Date.parse(fileData[i].lastSeen));
                        await this.addBranch(fileData[i].BranchId, fileData[i].Name, 0, 0, null, null, null)
                            .then(() => {
                            }).catch(err => {
                                uiNotify(err, 'error');
                            });
                    }
                    excelLine++;
                } else {
                    message = ' שורה  ' + excelLine + ' מתוך ' + fileData.length + ' ===> שם הסניף, מספר הסניף או קוד הגישה אינם תקינים';
                    console.log(message);
                    this.setState({ userMessage: message });
                    return;
                }
            }
            message = ' כל השורות בקובץ התעדכנו כראוי ';
            console.log(message);
            this.setState({ userMessage: message });
            // regradless of updates, we now need to re-load everything
            this.init().then(() => {
                this.setState({ loading: false })
            }).catch(err => {
                uiNotify(err, 'error');
            })
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
                    <div className='container'>
                        <div className='header-text'>{"סניפים"}</div>
                    </div>
                </div> */}
                <div className='grid-body'>
                    <div className='container'>
                        <DataGrid id={'gridContainer'}
                            onInitialized={(ref) => { this.dataGrid = ref.component }}
                            dataSource={new DataSource({ store: this.state.branches, paginate: false })}
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
                            <Export enabled={true} fileName={'branches'} />
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
                                <Popup title={'סניפים'} showTitle={true} width={700} height={300}>
                                </Popup>
                                <Form>
                                    <Item itemType={'group'} >
                                        <Item dataField={'BranchId'} />
                                        <Item dataField={'Name'} />
                                        <Item dataField={'BranchType'} />
                                        <Item dataField={'Percent'} />
                                        <Item dataField={'NetworkId'} />
                                    </Item>
                                    <Item itemType={'group'} caption={"דלי מכר"}>
                                        <Item dataField={'Weeks'} />
                                        <Item dataField={'TotMax'} />
                                        <Item dataField={'TotWeight'} />
                                    </Item>
                                </Form>
                            </Editing>

                            <Column dataField={'BranchId'} caption={'מספר סניף'}><RequiredRule /></Column>
                            <Column dataField={'Name'} caption={'שם סניף'}><RequiredRule /></Column>
                            <Column dataField={'BranchType'} caption={'סוג סניף'}
                                // editorOption={placeholder:'סוג סניף...'} 
                                lookup={{
                                    dataSource: () => this.state.branchTypes,
                                    displayExpr: "Name",
                                    valueExpr: "TypeId",
                                }}><RequiredRule /></Column>
                            <Column dataField={'NetworkId'} caption={'שם רשת'}
                                lookup={{
                                    dataSource: () => this.state.networks,
                                    displayExpr: "Name",
                                    valueExpr: "Id",
                                }}><RequiredRule /></Column>    
                            <Column dataField={'Percent'} caption={'אחוז תרומה לרשת'}><RequiredRule /></Column>
                            <Column dataField={'Weeks'} caption={'שבועות'} width={80} visible={false}></Column>
                            <Column dataField={'TotMax'} caption={'כמות מקסימלית'} width={80} visible={false}></Column>
                            <Column dataField={'TotWeight'} caption={'כמות שקיל'} width={80} visible={false}></Column>
                        </DataGrid>
                        <OutsidePopup title={'טעינה מקובץ'} showTitle={true} width={350} height={350} visible={this.state.isPopupVisible} onHiding={() => this.hidePopup()}>
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
                        </OutsidePopup>
                    </div>
                </div>
            </div>
        );
    }
}
