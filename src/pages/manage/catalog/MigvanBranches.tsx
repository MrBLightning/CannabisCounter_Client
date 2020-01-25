import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { DataGrid } from 'devextreme-react';
import DataSource from 'devextreme/data/data_source';
import { FilterRow, HeaderFilter, LoadPanel, Paging, Editing, Popup, Form, Column, RequiredRule, Export, Scrolling, Texts } from 'devextreme-react/data-grid';
import { Popup as OutsidePopup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import { Item } from 'devextreme-react/form';
import { MigvanBranch, Branch, CatalogItem, MigvanBranchName } from 'shared/interfaces/models/SystemModels';
import { getBranches, getCatalogItems, getMigvanBranches, addMigvanBranch, updateMigvanBranch, deleteMigvanBranch } from 'shared/api/migvanbranch.provider';
import { uiNotify } from 'shared/components/Toast';
import XLSX from 'xlsx';
import { checkPageVersion } from 'shared/components/Version-control';
import { setVersionButton } from '../ManagePage';
import { checkPageToeknTime } from 'shared/components/Token-time-control';
import { RbacPermission } from 'shared/store/auth/auth.types';
import { confirm } from 'devextreme/ui/dialog';

type MigvanBranchesProps = {
    permission: RbacPermission;
} & RouteComponentProps;

type MigvanBranchesState = {
    branches: Branch[],
    catalogs: CatalogItem[],
    migvanbranches: MigvanBranch[],
    migvanbranchNames: MigvanBranchName[],
    isPopupVisible: boolean,
    loading: boolean,
    userMessage: string,
}
export class MigvanBranches extends Component<MigvanBranchesProps> {
    dataGrid: any | null = null;
    state: MigvanBranchesState = {
        branches: [],
        catalogs: [],
        migvanbranches: [],
        migvanbranchNames: [],
        isPopupVisible: false,
        loading: true,
        userMessage: ''
    }

    updatePopupVisibility = (isPopupVisible: boolean): void => {
        this.setState({ isPopupVisible: isPopupVisible });
    }

    updateLoading = (loading: boolean): void => {
        this.setState({ loading: loading });
    }

    reloadDataGrid = (): void => {
        this.reloadAllMigvanBranches();
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

    loadAllCatalogItems = async (): Promise<void> => {
        try {
            const catalogs = await getCatalogItems();
            this.setState({ catalogs });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    // function for reloading all Migvan records
    reloadAllMigvanBranches = async (): Promise<void> => {
        // get all the lines in table 'migvan' from the node server
        try {
            const migvanbranches = await getMigvanBranches();
            this.setState({ migvanbranches });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
        let migvanbranchNames = [];
        this.setState({ migvanbrancheNames: [] });
        let length = this.state.migvanbranches.length;
        for (let i = 0; i < length; i++) {
            let migvanName = {
                Id: this.state.migvanbranches[i].Id,
                BranchId: this.state.migvanbranches[i].BranchId,
                BranchName: this.state.migvanbranches[i].BranchId,
                BarCode: this.state.migvanbranches[i].BarCode,
                CatalogName: this.state.migvanbranches[i].BarCode
            };
            migvanbranchNames.push(migvanName);
        }
        this.setState({ migvanbranchNames });
    }

    addMigvan = async (BranchId: number, BarCode: number): Promise<void> => {
        await addMigvanBranch(BranchId, BarCode);
    }

    updateMigvan = async (Id: number, BranchId: number, BarCode: number): Promise<void> => {
        await updateMigvanBranch(Id, BranchId, BarCode);
    }

    deleteMigvan = async (Id: number): Promise<void> => {
        await deleteMigvanBranch(Id);
    }

    init = async () => {
        await this.loadAllBranches();
        await this.loadAllCatalogItems();
        await this.reloadAllMigvanBranches();
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
    }

    loadMigvan = async (e: any) => {
        // Use Regular Expression (RegEx) to verify that the BarCode contains only numbers
        let reg = new RegExp('^[0-9]+$');
        if (!reg.test(e.target.BarCode.value)) {
            uiNotify('קוד יכול להכיל רק מספרים', 'error');
            // cancel the event
            e.cancel = true;
        }
        this.addMigvan(e.target.BranchId.value, e.target.BarCode.value).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
        // update the page to reflect the new catalog code
        await this.reloadAllMigvanBranches();
    }

    loadXLSX(e: any) {
        // var f = document.getElementById('file').files[0];
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
            let length = fileData.length;
            let migvanArray: MigvanBranch[] = this.state.migvanbranches;
            let errArray = [];
            let err = {
                BranchId: 0,
                BarCode: 0,
                Error: ''
            };
            for (var i = 0; i < length; i++) {
                if (!isNaN(fileData[i].BranchId) && !isNaN(fileData[i].BarCode) && fileData[i].BranchId >= 1 && fileData[i].BarCode >= 1) {
                    // check if the combination of banch-item already exists in this.state.migvans
                    let migvan = migvanArray.filter(function (migvan) {
                        return migvan.BranchId === fileData[i].BranchId &&
                            migvan.BarCode === fileData[i].BarCode;
                    });
                    console.log(i, migvan[0], fileData[i].BranchId, fileData[i].BarCode);
                    if (typeof migvan[0] === 'undefined') {
                        // migvan dosn't exist - we add a line and update the user message
                        message = ' שורה  ' + excelLine + ' מתוך ' + fileData.length + ' ===> סניף ' + fileData[i].BranchId + ' ופריט ' + fileData[i].BarCode + ' התווסף לטבלה';
                        console.log(message);
                        this.setState({ userMessage: message });
                        await this.addMigvan(fileData[i].BranchId, fileData[i].BarCode)
                            .then(() => {
                                migvanArray.push({ Id: i, BranchId: fileData[i].BranchId, BarCode: fileData[i].BarCode })
                            }).catch(err => {
                                uiNotify(err, 'error');
                            });
                    } else {
                        // migvan already exists - we do nothing but update the user message
                        message = ' שורה  ' + excelLine + ' מתוך ' + fileData.length + ' ===> סניף ' + fileData[i].BranchId + ' ופריט ' + fileData[i].BarCode + ' קיים בטבלה';
                        console.log(message);
                        this.setState({ userMessage: message });
                    }
                    excelLine++;
                } else {
                    console.log(i, fileData[i].BranchId, fileData[i].BarCode);
                    message = ' שורה  ' + excelLine + ' מתוך ' + fileData.length + ' ===>';
                    if (isNaN(fileData[i].BranchId)) message = message + ' מספר הסניף אינו תקין';
                    if (isNaN(fileData[i].BarCode)) message = message + ' מספר הפריט אינו תקין';
                    if (fileData[i].BranchId < 1) message = message + ' מספר הסניף אינו תקין';
                    if (fileData[i].BarCode < 1) message = message + ' מספר הפריט אינו תקין';
                    console.log(message);
                    this.setState({ userMessage: message });
                    err = {
                        BranchId: fileData[i].BranchId,
                        BarCode: fileData[i].BarCode,
                        Error: message
                    }
                    errArray.push(err);
                    //return;
                    excelLine++;
                }
            }
            // message = ' כל השורות בקובץ התעדכנו כראוי ';
            message = ' הרצת טעינה הסתיימה ';
            this.setState({ userMessage: message });
            // Export XLSX file with errors:
            // https://github.com/SheetJS/sheetjs/issues/817
            if (typeof errArray[0] != undefined && errArray.length > 1) {
                message = ' הרצת טעינה הסתיימה עם טעויות ';
                var ws = XLSX.utils.json_to_sheet(errArray);
                var wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "טעויות");
                XLSX.writeFile(wb, "טעויות.xlsx");
            }
            console.log(message);
            // regradless of updates, we now need to re-load all Migvans
            this.reloadAllMigvanBranches();
        }
    }

    render() {
        if (this.state.loading)
            return (
                <div className="app-loader">
                    <div className="loader" />
                </div>
            );

        const fileExample = (
            <div>
                <p>
                    <b style={{color:'red'}}>שימו לב - </b>
                    <span>במידה ויש טעויות, יפתח חלון שמירה לקובץ המרכז את הטעויות.</span>
                </p>
                <p style={{marginBottom:'0'}}>
                    <b>קובץ דוגמא (name.xlsx):</b>
                </p>
                <table>
                    <thead>
                        <tr>
                            <th>BarCode</th>
                            <td>,</td>
                            <th>BranchId</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1013</td>
                            <td></td>
                            <td>78</td>
                        </tr>
                        <tr>
                            <td>2011</td>
                            <td></td>
                            <td>502</td>
                        </tr>
                        <tr>
                            <td>3002</td>
                            <td></td>
                            <td>93</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );

        return (
            <div style={{ height: "100%" }}>
                <MigvanDataGrid
                    catalogs={this.state.catalogs}
                    branches={this.state.branches}
                    migvanbranchNames={this.state.migvanbranchNames}
                    isPopupVisible={this.state.isPopupVisible}
                    updatePopupVisibility={this.updatePopupVisibility}
                    updateLoading={this.updateLoading}
                    reloadDataGrid={this.reloadDataGrid}
                    permission={this.props.permission}
                ></MigvanDataGrid>
                <div>
                    <OutsidePopup title={'טעינה מקובץ'}
                        key="OUTSIDE_MIGVAN_POP"
                        deferRendering
                        dragEnabled={true}
                        showTitle={true}
                        rtlEnabled
                        closeOnOutsideClick={false}
                        width={350}
                        height={350}
                        visible={this.state.isPopupVisible}
                        onHiding={() => this.updatePopupVisibility(false)}
                        contentRender={(pros: any) => {
                            return (
                                <div className='grid-wrapper' dir='rtl'>
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        this.loadXLSX(e);
                                    }}>
                                        <input type="file" id="file" name="file" style={{ width: "235px", margin: "0 0 0 10px" }} />
                                        <Button text={'בצע'} useSubmitBehavior style={{ margin: "0px 0px 3px 0px" }}></Button>
                                    </form>
                                    <div>{fileExample}</div>
                                    <p>
                                        <b>{this.state.userMessage}</b>
                                    </p>
                                </div>
                            )
                        }}>
                    </OutsidePopup>
                </div>
            </div>
        );
    }

}

/************************************************************************ Class MigvanDataGrid *************************************************************************/
type MigvanDataGridProps = {
    catalogs: CatalogItem[],
    branches: Branch[],
    migvanbranchNames: MigvanBranchName[],
    isPopupVisible: boolean;
    permission: RbacPermission;
    updatePopupVisibility: (isPopupVisible: boolean) => void;
    updateLoading: (loading: boolean) => void;
    reloadDataGrid: () => void;
};

class MigvanDataGrid extends Component<MigvanDataGridProps>
{
    dataGrid: any | null = null;
    outsidePopupId: any | null = null;
    filteredDataSource: any | null = null;
    migvanNames: MigvanBranchName[] = this.props.migvanbranchNames;

    componentDidMount() {
    }

    addMigvan = async (BranchId: number, BarCode: number): Promise<void> => {
        await addMigvanBranch(BranchId, BarCode);
    }

    updateMigvan = async (Id: number, BranchId: number, BarCode: number): Promise<void> => {
        await updateMigvanBranch(Id, BranchId, BarCode);
    }

    deleteMigvan = async (Id: number): Promise<void> => {
        await deleteMigvanBranch(Id);
    }

    onInitialized = (e: any) => {
        // declare the grid eferance pointer
        this.dataGrid = e.component;
    }

    // part of the DataGrid life-cycle. Happens as soon as a line is added into the page table
    onRowInserting = async (e: any) => {
        let migvanName = this.migvanNames.filter(function (migvanName) {
            return migvanName.BarCode === parseInt(e.data.CatalogName, 10) && migvanName.BranchId === parseInt(e.data.BranchName, 10);
        });
        console.log('onRowInserting', e.data.BranchName, e.data.CatalogName, migvanName);
        if (typeof migvanName[0] !== 'undefined') {
            // alert('You cannot add this branch code - it already exists in the table');
            uiNotify('הצירוף של פריט זה לסניף זה כבר קיים בטבלה', 'error');
            // cancel the event
            e.cancel = true;
        } else {
            // update the server with a new migvan item
            await this.addMigvan(e.data.BranchName, e.data.CatalogName).then((id) => {
                this.props.reloadDataGrid();
            }).catch(err => {
                uiNotify(err, 'error');
            })
        }
    }

    onRowUpdating = async (e: any) => {
    }

    // part of the DataGrid life-cycle. Happens everytime a line is removed in the page table
    onRowRemoved = async (e: any) => {
        await this.deleteMigvan(e.Id).then(() => {
            this.props.reloadDataGrid();
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
                onClick: this.showPopup
            }
        }, {
            widget: 'dxButton',
            location: 'after',
            options: {
                text: 'מחיקת החיתוך',
                onClick: this.deleteFiltered
            }
        });
    }

    showPopup = () => {
        this.props.updatePopupVisibility(true);
    }

    deleteFiltered = () => {
        let result = confirm("<i>האם את/ה בטוח?</i>", "לבצע מחיקה");
        result.then((dialogResult) => {
            if (dialogResult) {
                var localGridData = new DataSource({
                    store: this.props.migvanbranchNames,
                    paginate: false
                });
                var filterExpr = this.dataGrid.getCombinedFilter();
                localGridData.filter(filterExpr);
                localGridData.load().then(async (filterResult) => {
                    for (var i = 0; i < filterResult.length; i++) {
                        var migvanName: MigvanBranchName = filterResult[i];
                        console.log('deleteMigvan', migvanName.Id);
                        await this.deleteMigvan(migvanName.Id).then(() => {
                            // refresh the data grid
                            this.props.reloadDataGrid();
                        }).catch(err => {
                            uiNotify(err, 'error');
                        });
                    }
                });
            }
        });
    }

    refreshDataGrid() {
        // https://js.devexpress.com/Documentation/Guide/Widgets/DataGrid/Filtering_and_Searching/
        this.dataGrid.clearFilter();
        console.log('refreshDataGrid', this.dataGrid.getCombinedFilter);
    }

    // cannot add this since if we eliminate the this.dataGrid pointer we cannot preform deleteFiltered
    componentWillUnmount() {
        this.dataGrid = null;
    }

    shouldComponentUpdate(nextProps: MigvanDataGridProps, nextState: any) {
        if (this.props.migvanbranchNames === nextProps.migvanbranchNames)
            return false;
        return true;
    }

    render() {
        return (
            <div className='grid-wrapper'>
                {/* <div className='grid-header'>
                    <div className='container'>
                        <div className='header-text'>{"ניהול מגוון לסניף"}</div>
                    </div>
                </div> */}
                <div className='grid-body'>
                    <div className='container'>
                        <DataGrid id={'gridContainer'}
                            onInitialized={(ref) => { this.dataGrid = ref.component }}
                            className="grid-element"
                            dataSource={new DataSource({ store: this.migvanNames, paginate: true })}
                            activeStateEnabled={false}
                            showColumnLines={true}
                            showRowLines={true}
                            showBorders={true}
                            rtlEnabled={true}
                            width={'100%'} //Hardcoded
                            rowAlternationEnabled={true}
                            columnAutoWidth={true}
                            onRowInserting={(e) => this.onRowInserting(e)}
                            onRowUpdating={(e) => this.onRowUpdating(e)}
                            onRowRemoved={(e) => this.onRowRemoved(e.data)}
                            // onEditorPreparing={this.onEditorPreparing}
                            onToolbarPreparing={this.onToolbarPreparing}
                        >
                            <FilterRow
                                visible={true}
                                applyFilter={'auto'}
                                showAllText={''}
                            ></FilterRow>
                            <HeaderFilter visible={true} />
                            <Scrolling mode={'virtual'} />
                            <LoadPanel enabled={true} />

                            <Paging enabled={false} />
                            <Editing
                                // mode={'row'}
                                mode={'popup'}
                                allowUpdating={false}
                                allowDeleting={this.props.permission.delete}
                                allowAdding={this.props.permission.create}
                                useIcons={true}>
                                <Popup key="UPDATE_MIGVAN_POP" title={'הוספת פריט לסניף'} showTitle={true} width={300} height={250} >
                                </Popup>
                                <Form key="UPDATE_MIGVAN_FORM">
                                    <Item itemType={'group'} colSpan={2}>
                                        <Item dataField={'BranchName'} colSpan={2} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'CatalogName'} colSpan={2} cssClass={'Form-item-texteditor'} />
                                    </Item>
                                </Form>
                            </Editing>
                            <Export enabled={true} fileName={'migvan_branches'} />
                            <Column key='b_branchId' dataField={'BranchId'} caption={'קוד סניף'} width={100}></Column>
                            <Column key='b_branchName' dataField={'BranchName'} caption={'שם סניף'} lookup={{
                                dataSource: () => this.props.branches,
                                displayExpr: "Name",
                                valueExpr: "BranchId"
                            }}><RequiredRule /></Column>
                            <Column key='b_barCode' dataField={'BarCode'} caption={'קוד פריט'} width={100}></Column>
                            <Column key='b_catalogName' dataField={'CatalogName'} caption={'שם פריט'} lookup={{
                                dataSource: () => this.props.catalogs,
                                displayExpr: "Name",
                                valueExpr: "BarCode"
                            }}><RequiredRule /></Column>
                        </DataGrid>
                    </div>
                </div>
            </div >
        );
    }
}

