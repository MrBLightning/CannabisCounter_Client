import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { DataGrid, SelectBox, TextBox, CheckBox } from 'devextreme-react';
import DataSource from 'devextreme/data/data_source';
import { FilterRow, HeaderFilter, LoadPanel, Paging, Editing, Popup, Form, Column, RequiredRule, Export, Scrolling, MasterDetail } from 'devextreme-react/data-grid';
import { Popup as OutsidePopup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import { Item } from 'devextreme-react/form';
import { Sapak, Branch, AspakaRecord, AspakaUnique, AspakaDetail } from 'shared/interfaces/models/SystemModels';
import { uiNotify } from 'shared/components/Toast';
import XLSX from 'xlsx';
import { checkPageVersion } from 'shared/components/Version-control';
import { setVersionButton } from '../ManagePage';
import { getSapakim, getBranches, getAspakaRecords, addAspakaRecord, updateAspakaRecord, deleteAspakaRecord } from 'shared/api/aspaka.provider';
import { checkPageToeknTime } from 'shared/components/Token-time-control';
import { RbacPermission } from 'shared/store/auth/auth.types';
import AspakaDetailTemplate from './AspakaDetail';

type AspakaProps = {
    permission: RbacPermission;
} & RouteComponentProps;
type AspakaState = {
    sapakim: Sapak[],
    branches: Branch[],
    aspakaRecords: AspakaRecord[],
    aspakaUnique: AspakaUnique[],
    isPopupVisible: boolean,
    loading: boolean,
    userMessage: string,
}
export class Aspaka extends Component<AspakaProps> {
    dataGrid: any | null = null;
    state: AspakaState = {
        sapakim: [],
        branches: [],
        aspakaRecords: [],
        aspakaUnique: [],
        isPopupVisible: false,
        loading: true,
        userMessage: '',
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

    loadAllBranches = async (): Promise<void> => {
        try {
            const branches = await getBranches();
            this.setState({ branches });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    reloadAllAspakaRecords = async (): Promise<void> => {
        try {
            const aspakaRecords = await getAspakaRecords();
            this.setState({ aspakaRecords });
            const aspakaUnique: AspakaUnique[] = [];
            const map = new Map();
            let key = '';
            let length = aspakaRecords.length;
            let OrderDay_1 = null;
            let AspakaDay_1 = null;
            let OrderDay_2 = null;
            let AspakaDay_2 = null;
            let OrderDay_3 = null;
            let AspakaDay_3 = null;
            let OrderDay_4 = null;
            let AspakaDay_4 = null;
            let OrderDay_5 = null;
            let AspakaDay_5 = null;
            let OrderDay_6 = null;
            let AspakaDay_6 = null;
            // for (const item of aspakaRecords) {
            //     key = item.SapakId + "#" + item.BranchId;
            //     if (!map.has(key)) {
            //         map.set(key, true);    // set a unique value to Map
            //         aspakaUnique.push({
            //             Id: item.Id,
            //             SapakId: item.SapakId,
            //             BranchId: item.BranchId,
            //             OrderDay_1: null,
            //             AspakaDay_1: null,
            //             OrderDay_2: null,
            //             AspakaDay_2: null,
            //             OrderDay_3: null,
            //             AspakaDay_3: null,
            //             OrderDay_4: null,
            //             AspakaDay_4: null,
            //             OrderDay_5: null,
            //             AspakaDay_5: null,
            //             OrderDay_6: null,
            //             AspakaDay_6: null,
            //             Wensell: item.Wensell,
            //             Key: key
            //         });
            //     }
            // }
            for (let i = 0; i < length; i++) {
                key = aspakaRecords[i].SapakId + "#" + aspakaRecords[i].BranchId;
                if (!map.has(key)) {
                    let currDetail = aspakaRecords.filter(record => record.BranchId == aspakaRecords[i].BranchId
                        && record.SapakId == aspakaRecords[i].SapakId);
                    let length2 = currDetail.length;
                    OrderDay_1 = null;
                    AspakaDay_1 = null;
                    OrderDay_2 = null;
                    AspakaDay_2 = null;
                    OrderDay_3 = null;
                    AspakaDay_3 = null;
                    OrderDay_4 = null;
                    AspakaDay_4 = null;
                    OrderDay_5 = null;
                    AspakaDay_5 = null;
                    OrderDay_6 = null;
                    AspakaDay_6 = null;
                    for (let c = 0; c < length2; c++) {
                        if (c == 0) {
                            OrderDay_1 = currDetail[c].OrderDay;
                            AspakaDay_1 = currDetail[c].AspakaDay;
                        }
                        if (c == 1) {
                            OrderDay_2 = currDetail[c].OrderDay;
                            AspakaDay_2 = currDetail[c].AspakaDay;
                        }
                        if (c == 2) {
                            OrderDay_3 = currDetail[c].OrderDay;
                            AspakaDay_3 = currDetail[c].AspakaDay;
                        }
                        if (c == 3) {
                            OrderDay_4 = currDetail[c].OrderDay;
                            AspakaDay_4 = currDetail[c].AspakaDay;
                        }
                        if (c == 4) {
                            OrderDay_5 = currDetail[c].OrderDay;
                            AspakaDay_5 = currDetail[c].AspakaDay;
                        }
                        if (c == 5) {
                            OrderDay_6 = currDetail[c].OrderDay;
                            AspakaDay_6 = currDetail[c].AspakaDay;
                        }
                    }
                    map.set(key, true);    // set a unique value to Map
                    aspakaUnique.push({
                        Id: aspakaRecords[i].Id,
                        SapakId: aspakaRecords[i].SapakId,
                        BranchId: aspakaRecords[i].BranchId,
                        OrderDay_1: OrderDay_1,
                        AspakaDay_1: AspakaDay_1,
                        OrderDay_2: OrderDay_2,
                        AspakaDay_2: AspakaDay_2,
                        OrderDay_3: OrderDay_3,
                        AspakaDay_3: AspakaDay_3,
                        OrderDay_4: OrderDay_4,
                        AspakaDay_4: AspakaDay_4,
                        OrderDay_5: OrderDay_5,
                        AspakaDay_5: AspakaDay_5,
                        OrderDay_6: OrderDay_6,
                        AspakaDay_6: AspakaDay_6,
                        Wensell: aspakaRecords[i].Wensell,
                        Key: key
                    });
                }
            }
            this.setState({ aspakaUnique });
        } catch (err) {
            console.error(err);
            uiNotify(err, 'error');
        }
    }

    addAspakaRecord = async (SapakId: number, BranchId: string, AspakaDay: number, OrderDay: number,
        Wensell: number, days_order: number): Promise<void> => {
        await addAspakaRecord(SapakId, BranchId, AspakaDay, OrderDay, Wensell, days_order);
    }

    updateAspakaRecord = async (Id: number, SapakId: number, BranchId: string, AspakaDay: number, OrderDay: number,
        Wensell: number, days_order: number): Promise<void> => {
        await updateAspakaRecord(Id, SapakId, BranchId, AspakaDay, OrderDay, Wensell, days_order);
    }

    deleteAspakaRecord = async (Id: number): Promise<void> => {
        await deleteAspakaRecord(Id);
    }

    init = async () => {
        await this.loadAllBranches();
        await this.loadAllSapakim();
        await this.reloadAllAspakaRecords();
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
        if (typeof this.state.aspakaRecords.filter(record => record.SapakId === parseInt(e.data.SapakId, 10) &&
            record.BranchId === parseInt(e.data.BranchId, 10))[0] !== 'undefined') {
            uiNotify('אי אפשר להוסיף את הצירוף הזה - הוא כבר קיים בטבלה', 'error');
            // cancel the event
            e.cancel = true;
        }
    }

    // part of the DataGrid life-cycle. Happens everytime a line is inserted into the page table
    onRowInserted = async (e: any) => {
        await this.createMultiLine(e);
        await this.reloadAllAspakaRecords();
    }

    // part of the DataGrid life-cycle. Happens everytime a line is removed in the page table
    onRowRemoved = async (e: any) => {    
        await this.deleteMultiLine(e);
    }

    // part of the DataGrid life-cycle. Happens everytime a line is updated in the page table
    onRowUpdated = async (e: any) => {
        // remove existing records
        await this.deleteMultiLine(e);
        // create new records
        await this.createMultiLine(e);
        await this.reloadAllAspakaRecords();
    }

    createMultiLine(e:any){
        const array = [
            {
                OrderDay: e.OrderDay_1,
                AspakaDay: e.AspakaDay_1
            },
            {
                OrderDay: e.OrderDay_2,
                AspakaDay: e.AspakaDay_2
            },
            {
                OrderDay: e.OrderDay_3,
                AspakaDay: e.AspakaDay_3
            },
            {
                OrderDay: e.OrderDay_4,
                AspakaDay: e.AspakaDay_4
            },
            {
                OrderDay: e.OrderDay_5,
                AspakaDay: e.AspakaDay_5
            },
            {
                OrderDay: e.OrderDay_6,
                AspakaDay: e.AspakaDay_6
            },
        ];
        const result = [];
        const map = new Map();
        for (const item of array) {
            if (!map.has(item.OrderDay) && item.OrderDay >= 1) {
                map.set(item.OrderDay, true);    // set Map by OrderDay value
                result.push({
                    OrderDay: item.OrderDay,
                    AspakaDay: item.AspakaDay
                });
            }
        }
        if (result[0] && result[0].OrderDay != undefined )
            // console.log(result[0]);
            this.addAspakaRecord(e.SapakId, e.BranchId, result[0].AspakaDay, result[0].OrderDay, e.Wensell, e.days_order).then(() => {

            }).catch(err => {
                uiNotify(err, 'error');
            })
        if (result[1] && result[1].OrderDay != undefined)
            // console.log(result[1]);
            this.addAspakaRecord(e.SapakId, e.BranchId, result[1].AspakaDay, result[1].OrderDay, e.Wensell, e.days_order).then(() => {

            }).catch(err => {
                uiNotify(err, 'error');
            })
        if (result[2] && result[2].OrderDay != undefined)
            // console.log(result[2]);
            this.addAspakaRecord(e.SapakId, e.BranchId, result[2].AspakaDay, result[2].OrderDay, e.Wensell, e.days_order).then(() => {

            }).catch(err => {
                uiNotify(err, 'error');
            })
        if (result[3] && result[3].OrderDay != undefined)
            // console.log(result[3]);
            this.addAspakaRecord(e.SapakId, e.BranchId, result[3].AspakaDay, result[3].OrderDay, e.Wensell, e.days_order).then(() => {

            }).catch(err => {
                uiNotify(err, 'error');
            })
        if (result[4] && result[4].OrderDay != undefined)
            // console.log(result[4]);
            this.addAspakaRecord(e.SapakId, e.BranchId, result[4].AspakaDay, result[4].OrderDay, e.Wensell, e.days_order).then(() => {

            }).catch(err => {
                uiNotify(err, 'error');
            })
        if (result[5] && result[5].OrderDay != undefined)
            // console.log(result[5]);
            this.addAspakaRecord(e.SapakId, e.BranchId, result[5].AspakaDay, result[5].OrderDay, e.Wensell, e.days_order).then(() => {

            }).catch(err => {
                uiNotify(err, 'error');
            })
    }

    deleteMultiLine(e:any){
        const array = this.state.aspakaRecords.filter(record => record.BranchId == e.BranchId
            && record.SapakId == e.SapakId);
        for (let i = 0; i < array.length; i++) {

            this.deleteAspakaRecord(array[i].Id).then(() => {

            }).catch(err => {
                uiNotify(err, 'error');
            })    
        }
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

        const notEditableOnUpdate: any = ['SapakId', 'BranchId']; // data field names of columns not editable on update  
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
        let vansel = [
            { "Id": 1, "Name": "כן", },
            { "Id": 0, "Name": "לא", }];

        let days = [
            { "Id": 0, "Name": null, },
            { "Id": 1, "Name": "ראשון", },
            { "Id": 2, "Name": "שני", },
            { "Id": 3, "Name": "שלישי", },
            { "Id": 4, "Name": "רביעי", },
            { "Id": 5, "Name": "חמישי", },
            { "Id": 6, "Name": "שישי", }
        ];

        return (
            <div className='grid-wrapper'>
                {/* <div className='grid-header'>
                    <div className='container'>
                        <div className='header-text'>{"ימי אספקה"}</div>
                    </div>
                </div> */}
                <div className='grid-body'>
                    <div className='container'>
                        <DataGrid id={'gridContainer'}
                            onInitialized={(ref) => { this.dataGrid = ref.component }}
                            dataSource={new DataSource({ store: this.state.aspakaUnique, paginate: true })}
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
                            keyExpr={'Key'}
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
                            <Export enabled={true} fileName={'aspaka'} />
                            <Editing
                                // mode={'row'}
                                mode={'popup'}
                                allowUpdating={this.props.permission.edit}
                                allowDeleting={this.props.permission.delete}
                                allowAdding={this.props.permission.create}
                                useIcons={true}>
                                <Popup title={'ימי אספקה'} showTitle={true} width={650} height={550}>
                                </Popup>
                                <Form>
                                    <Item itemType={'group'} colCount={2}>
                                        <Item dataField={'SapakId'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'BranchId'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'OrderDay_1'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'AspakaDay_1'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'OrderDay_2'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'AspakaDay_2'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'OrderDay_3'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'AspakaDay_3'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'OrderDay_4'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'AspakaDay_4'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'OrderDay_5'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'AspakaDay_5'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'OrderDay_6'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'AspakaDay_6'} cssClass={'Form-item-texteditor'} />
                                        <Item dataField={'Wensell'} />
                                    </Item>
                                </Form>
                            </Editing>

                            <Column dataField={'SapakId'} caption={'ספק'}
                                lookup={{
                                    dataSource: () => this.state.sapakim,
                                    displayExpr: "Name",
                                    valueExpr: "Id",
                                }}><RequiredRule /></Column>
                            <Column dataField={'BranchId'} caption={'סניף'}
                                lookup={{
                                    dataSource: () => this.state.branches,
                                    displayExpr: "Name",
                                    valueExpr: "BranchId",
                                }}><RequiredRule /></Column>
                            <Column dataField={'OrderDay_1'} caption={'יום הזמנה'} visible={false} lookup={{
                                dataSource: days,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'AspakaDay_1'} caption={'יום אספקה'} visible={false} lookup={{
                                dataSource: days,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'OrderDay_2'} caption={'יום הזמנה'} visible={false} lookup={{
                                dataSource: days,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'AspakaDay_2'} caption={'יום אספקה'} visible={false} lookup={{
                                dataSource: days,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'OrderDay_3'} caption={'יום הזמנה'} visible={false} lookup={{
                                dataSource: days,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'AspakaDay_3'} caption={'יום אספקה'} visible={false} lookup={{
                                dataSource: days,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'OrderDay_4'} caption={'יום הזמנה'} visible={false} lookup={{
                                dataSource: days,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'AspakaDay_4'} caption={'יום אספקה'} visible={false} lookup={{
                                dataSource: days,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'OrderDay_5'} caption={'יום הזמנה'} visible={false} lookup={{
                                dataSource: days,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'AspakaDay_5'} caption={'יום אספקה'} visible={false} lookup={{
                                dataSource: days,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'OrderDay_6'} caption={'יום הזמנה'} visible={false} lookup={{
                                dataSource: days,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'AspakaDay_6'} caption={'יום אספקה'} visible={false} lookup={{
                                dataSource: days,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <Column dataField={'Wensell'} caption={'ואנסל'} width={80} dataType={'boolean'} lookup={{
                                dataSource: vansel,
                                displayExpr: "Name",
                                valueExpr: "Id"
                            }}></Column>
                            <MasterDetail
                                enabled={true}
                                component={AspakaDetailTemplate}
                            />
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
            </div >
        );
    }
}