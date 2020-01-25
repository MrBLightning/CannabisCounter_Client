import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { DataGrid } from 'devextreme-react';
import DataSource from 'devextreme/data/data_source';
import { FilterRow, HeaderFilter, LoadPanel, Paging, Editing, Popup, Form, Column, RequiredRule, Export, Scrolling, Texts } from 'devextreme-react/data-grid';
import { Popup as OutsidePopup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import { Item } from 'devextreme-react/form';
import { MigvanSapak, Sapak, CatalogItem, MigvanSapakName } from 'shared/interfaces/models/SystemModels';
import { getSapakim, getCatalogItems, getMigvanSapakim, addMigvanSapak, updateMigvanSapak, deleteMigvanSapak } from 'shared/api/migvansapak.provider';
import { uiNotify } from 'shared/components/Toast';
import XLSX from 'xlsx';
import { checkPageVersion } from 'shared/components/Version-control';
import { setVersionButton } from '../ManagePage';
import { checkPageToeknTime } from 'shared/components/Token-time-control';
import { RbacPermission } from 'shared/store/auth/auth.types';
import { confirm } from 'devextreme/ui/dialog';

type MigvanSapakimProps = {
    permission: RbacPermission;
} & RouteComponentProps;

type MigvanSapakimState = {
    sapakim: Sapak[],
    catalogs: CatalogItem[],
    migvansapakim: MigvanSapak[],
    migvansapakNames: MigvanSapakName[],
    isPopupVisible: boolean,
    loading: boolean,
    userMessage: string,
}
export class MigvanSapakim extends Component<MigvanSapakimProps> {
    dataGrid: any | null = null;
    state: MigvanSapakimState = {
        sapakim: [],
        catalogs: [],
        migvansapakim: [],
        migvansapakNames: [],
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
        this.reloadAllMigvanSapakim();
    }

    loadAllSapakim = async (): Promise<void> => {
        try {
            const sapakim = await getSapakim();
            this.setState({ sapakim });
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
    reloadAllMigvanSapakim = async (): Promise<void> => {
        // get all the lines in table 'migvan' from the node server
        try {
            const migvansapakim = await getMigvanSapakim();
            this.setState({ migvansapakim });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
        let migvansapakNames = [];
        this.setState({ migvansapakNames: [] });
        let length = this.state.migvansapakim.length;
        for (let i = 0; i < length; i++) {
            let migvanName = {
                Id: this.state.migvansapakim[i].Id,
                SapakId: this.state.migvansapakim[i].SapakId,
                SapakName: this.state.migvansapakim[i].SapakId,
                BarCode: this.state.migvansapakim[i].BarCode,
                CatalogName: this.state.migvansapakim[i].BarCode,
                Code: this.state.migvansapakim[i].Code,
                Main: this.state.migvansapakim[i].Main,
            };
            migvansapakNames.push(migvanName);
        }
        this.setState({ migvansapakNames });
    }

    addMigvan = async (SapakId: number, BarCode: number, Code: number, Main: number): Promise<void> => {
        await addMigvanSapak(SapakId, BarCode, Code, Main);
    }

    updateMigvan = async (Id: number, SapakId: number, BarCode: number, Code: number, Main: number): Promise<void> => {
        await updateMigvanSapak(Id, SapakId, BarCode, Code, Main);
    }

    deleteSapak = async (Id: number): Promise<void> => {
        await deleteMigvanSapak(Id);
    }

    init = async () => {
        await this.loadAllSapakim();
        await this.loadAllCatalogItems();
        await this.reloadAllMigvanSapakim();
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
        if (!reg.test(e.target.BarCode.value) || !reg.test(e.target.SapakId.value)) {
            uiNotify('קוד יכול להכיל רק מספרים', 'error');
            // cancel the event
            e.cancel = true;
        }
        this.addMigvan(e.target.SapakId.value, e.target.BarCode.value, e.target.Code.value, e.target.Main.value).then(() => {

        }).catch(err => {
            uiNotify(err, 'error');
        })
        // update the page to reflect the new catalog code
        await this.reloadAllMigvanSapakim();
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
            let migvanArray: MigvanSapak[] = this.state.migvansapakim;
            let errArray = [];
            let err = {
                SapakId: 0,
                BarCode: 0,
                Code: 0,
                Main: 0,
                Error: ''
            };
            for (var i = 0; i < length; i++) {
                if (!isNaN(fileData[i].SapakId) && !isNaN(fileData[i].BarCode) && !isNaN(fileData[i].Code) &&
                    fileData[i].SapakId >= 1 && fileData[i].BarCode >= 1 && fileData[i].Code >= 1) {
                    let migvan = migvanArray.filter(function (migvan) {
                        return migvan.SapakId === fileData[i].SapakId &&
                            migvan.BarCode === fileData[i].BarCode &&
                            migvan.Code === fileData[i].Code;
                    });
                    console.log(i, migvan[0], fileData[i].SapakId, fileData[i].BarCode, fileData[i].Code, fileData[i].Main);
                    if (typeof migvan[0] === 'undefined') {
                        // migvan dosn't exist - we add a line and update the user message
                        message = ' שורה  ' + excelLine + ' מתוך ' + fileData.length + ' ===> ספק ' + fileData[i].SapakId + ' ופריט ' + fileData[i].BarCode + ' התווסף לטבלה';
                        console.log(message);
                        this.setState({ userMessage: message });
                        await this.addMigvan(fileData[i].SapakId, fileData[i].BarCode, fileData[i].Code, fileData[i].Main)
                            .then(() => {
                                migvanArray.push({ Id: i, SapakId: fileData[i].SapakId, BarCode: fileData[i].BarCode, Code: fileData[i].Code, Main: fileData[i].Main })
                            }).catch(err => {
                                uiNotify(err, 'error');
                            });
                    } else {
                        // migvan already exists - we do nothing but update the user message
                        message = ' שורה  ' + excelLine + ' מתוך ' + fileData.length + ' ===> ספק ' + fileData[i].SapakId + ' ופריט ' + fileData[i].BarCode + ' קיים בטבלה';
                        console.log(message);
                        this.setState({ userMessage: message });
                    }
                    excelLine++;
                } else {
                    console.log(i, fileData[i].SapakId, fileData[i].BarCode, fileData[i].Code, fileData[i].Main);
                    message = ' שורה  ' + excelLine + ' מתוך ' + fileData.length + ' ===>';
                    if (isNaN(fileData[i].SapakId)) message = message + ' מספר הספק אינו תקין';
                    if (isNaN(fileData[i].BarCode)) message = message + ' מספר הפריט אינו תקין';
                    if (isNaN(fileData[i].Code)) message = message + ' קוד אינו תקין';
                    if (fileData[i].SapakId < 1) message = message + ' מספר הספק אינו תקין';
                    if (fileData[i].BarCode < 1) message = message + ' מספר הפריט אינו תקין';
                    if (fileData[i].Code < 1) message = message + ' קוד אינו תקין';
                    console.log(message);
                    this.setState({ userMessage: message });
                    err = {
                        SapakId: fileData[i].SapakId,
                        BarCode: fileData[i].BarCode,
                        Code: fileData[i].Code,
                        Main: fileData[i].Main,
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
            this.reloadAllMigvanSapakim();
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
                    <b style={{ color: 'red' }}>שימו לב - </b>
                    <span>במידה ויש טעויות, יפתח חלון שמירה לקובץ המרכז את הטעויות.</span>
                </p>
                <p style={{ marginBottom: '0' }}>
                    <b>קובץ דוגמא (name.xlsx):</b>
                </p>
                <table>
                    <thead>
                        <tr>
                            <th>Main</th>
                            <td>,</td>
                            <th>Code</th>
                            <td>,</td>
                            <th>BarCode</th>
                            <td>,</td>
                            <th>SapakId</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>0</td>
                            <td>,</td>
                            <td>456</td>
                            <td>,</td>
                            <td>1013</td>
                            <td>,</td>
                            <td>30572</td>
                        </tr>
                        <tr>
                            <td>0</td>
                            <td>,</td>
                            <td>567</td>
                            <td>,</td>
                            <td>1013</td>
                            <td>,</td>
                            <td>30572</td>
                        </tr>
                        <tr>
                            <td>0</td>
                            <td>,</td>
                            <td>444</td>
                            <td>,</td>
                            <td>1017</td>
                            <td>,</td>
                            <td>30048</td>
                        </tr>
                        <tr>
                            <td>1</td>
                            <td>,</td>
                            <td>7682</td>
                            <td>,</td>
                            <td>1017</td>
                            <td>,</td>
                            <td>30048</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );

        return (
            <div style={{ height: "100%" }}>
                <MigvanDataGrid
                    catalogs={this.state.catalogs}
                    sapakim={this.state.sapakim}
                    migvansapakNames={this.state.migvansapakNames}
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
    sapakim: Sapak[],
    migvansapakNames: MigvanSapakName[],
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
    migvanNames: MigvanSapakName[] = this.props.migvansapakNames;

    componentDidMount() {
    }

    addMigvan = async (SapakId: number, BarCode: number, Code: number, Main: number): Promise<void> => {
        await addMigvanSapak(SapakId, BarCode, Code, Main);
    }

    updateMigvan = async (Id: number, SapakId: number, BarCode: number, Code: number, Main: number): Promise<void> => {
        await updateMigvanSapak(Id, SapakId, BarCode, Code, Main);
    }

    deleteMigvan = async (Id: number): Promise<void> => {
        await deleteMigvanSapak(Id);
    }

    onInitialized = (e: any) => {
        // declare the grid eferance pointer
        this.dataGrid = e.component;
    }

    // part of the DataGrid life-cycle. Happens as soon as a line is added into the page table
    onRowInserting = async (e: any) => {
        let migvanName = this.migvanNames.filter(function (migvanName) {
            return migvanName.BarCode === parseInt(e.data.CatalogName, 10)
                && migvanName.SapakId === parseInt(e.data.SapakName, 10)
                && migvanName.Code === parseInt(e.data.Code, 10);
        });
        console.log('onRowInserting', e.data.SapakName, e.data.CatalogName, migvanName);
        if (typeof migvanName[0] !== 'undefined') {
            uiNotify('הצירוף של ספק-פריט-קוד הזה כבר קיים בטבלה', 'error');
            // cancel the event
            e.cancel = true;
        } else {
            // update the server with a new migvan item
            let main: number;
            (e.data.Main === false) ? main = 0 : main = 1;
            await this.addMigvan(e.data.SapakName, e.data.CatalogName, e.data.Code, main).then((id) => {
                this.props.reloadDataGrid();
            }).catch(err => {
                uiNotify(err, 'error');
            })
        }
    }

    onRowUpdating = async (e: any) => {
        let id = e.key.id;
        let SapakId = e.oldData.SapakName;
        let BarCode = e.oldData.CatalogName;
        let Code = e.oldData.Code;
        let main = 0;
        if (typeof e.newData.SapakId != 'undefined') {
            SapakId = e.newData.SapakId;
        }
        if (typeof e.newData.BarCode != 'undefined') {
            BarCode = e.newData.BarCode;
        }
        if (typeof e.newData.Code != 'undefined') {
            Code = e.newData.Code;
        }
        (e.key.Main === false) ? main = 0 : main = 1;
        if (typeof e.newData.Main != 'undefined') {
            (e.newData.Main === false) ? main = 0 : main = 1;
        }
        await this.updateMigvan(id, SapakId, BarCode, Code, main).then(() => {
            // send refresh request to Parent
            this.props.reloadDataGrid();
            // e.cancel = true;
        }).catch(err => {
            uiNotify(err, 'error');
        })
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
        },
            // {
            //     widget: 'dxButton',
            //     location: 'after',
            //     options: {
            //         text: 'מחיקת החיתוך',
            //         onClick: this.deleteFiltered
            //     }
            // }
        );
    }

    showPopup = () => {
        this.props.updatePopupVisibility(true);
    }

    deleteFiltered = () => {
        let result = confirm("<i>האם את/ה בטוח?</i>", "לבצע מחיקה");
        result.then((dialogResult) => {
            if (dialogResult) {
                var localGridData = new DataSource({
                    store: this.props.migvansapakNames,
                    paginate: false
                });
                var filterExpr = this.dataGrid.getCombinedFilter();
                localGridData.filter(filterExpr);
                localGridData.load().then(async (filterResult) => {
                    for (var i = 0; i < filterResult.length; i++) {
                        var migvanName: MigvanSapakName = filterResult[i];
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
        if (this.props.migvansapakNames === nextProps.migvansapakNames)
            return false;
        return true;
    }

    render() {
        return (
            <div className='grid-wrapper'>
                {/* <div className='grid-header'>
                    <div className='container'>
                        <div className='header-text'>{"ניהול מגוון לספק"}</div>
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
                                allowUpdating={this.props.permission.edit}
                                allowDeleting={this.props.permission.delete}
                                allowAdding={this.props.permission.create}
                                useIcons={true}>
                                <Texts
                                    confirmDeleteMessage="האם אתם בטוחים שברצונכם למחוק את השורה הזו?"
                                />
                                <Popup key="UPDATE_MIGVAN_POP" title={'הוספת פריט לספק'} showTitle={true} width={350} height={350} >
                                </Popup>
                                <Form key="UPDATE_MIGVAN_FORM">
                                    <Item itemType={'group'} >
                                        <Item dataField={'SapakName'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'CatalogName'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'Code'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'Main'} cssClass={'Form-item-texteditor'} />
                                    </Item>
                                </Form>
                            </Editing>
                            <Export enabled={true} fileName={'migvan_sapak'} />
                            <Column key='b_sapakId' dataField={'SapakId'} caption={'קוד ספק'} width={100}></Column>
                            <Column key='b_sapakName' dataField={'SapakName'} caption={'שם ספק'} lookup={{
                                dataSource: () => this.props.sapakim,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}><RequiredRule /></Column>
                            <Column key='b_barCode' dataField={'BarCode'} caption={'קוד פריט'} width={100}></Column>
                            <Column key='b_catalogName' dataField={'CatalogName'} caption={'שם פריט'} lookup={{
                                dataSource: () => this.props.catalogs,
                                displayExpr: "Name",
                                valueExpr: "BarCode"
                            }}><RequiredRule /></Column>
                            <Column key='b_code' dataField={'Code'} caption={'מקט ספק'} ><RequiredRule /></Column>
                            <Column key='b_main' dataField={'Main'} dataType='boolean' caption={'ראשי'} allowFiltering={false} width={50} ></Column>
                        </DataGrid>
                    </div>
                </div>
            </div >
        );
    }
}

